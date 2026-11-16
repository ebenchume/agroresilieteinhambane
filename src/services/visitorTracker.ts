import { useEffect, useState } from 'react';

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  onlineNow: number;
  peakOnline: number;
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdated: string | null;
}

const VISITOR_ID_KEY = 'agro_visitor_id';
const SESSION_TAB_ID_KEY = 'agro_session_tab_id';
const VISIT_RECORDED_KEY = 'agro_visit_recorded';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const created = generateId('v');
    localStorage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch {
    return generateId('v');
  }
}

function getOrCreateSessionTabId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_TAB_ID_KEY);
    if (existing) return existing;
    const created = generateId('t');
    sessionStorage.setItem(SESSION_TAB_ID_KEY, created);
    return created;
  } catch {
    return generateId('t');
  }
}

class VisitorTrackerSingleton {
  private stats: VisitorStats = {
    totalVisits: 0,
    uniqueVisitors: 0,
    onlineNow: 0,
    peakOnline: 0,
    isConnected: false,
    isConnecting: true,
    lastUpdated: null,
  };

  private listeners = new Set<(stats: VisitorStats) => void>();
  private ws: WebSocket | null = null;
  private initialized = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private visitorId = '';
  private sessionTabId = '';

  public subscribe(listener: (stats: VisitorStats) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.stats });

    if (typeof window !== 'undefined' && !this.initialized) {
      this.init();
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = { ...this.stats };
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private applyServerPayload(payload: Partial<VisitorStats> & { timestamp?: string }) {
    this.stats = {
      ...this.stats,
      totalVisits: typeof payload.totalVisits === 'number' ? payload.totalVisits : this.stats.totalVisits,
      uniqueVisitors: typeof payload.uniqueVisitors === 'number' ? payload.uniqueVisitors : this.stats.uniqueVisitors,
      onlineNow: typeof payload.onlineNow === 'number' ? payload.onlineNow : this.stats.onlineNow,
      peakOnline: typeof payload.peakOnline === 'number' ? payload.peakOnline : this.stats.peakOnline,
      lastUpdated: payload.timestamp || new Date().toISOString(),
    };
    this.emit();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    this.visitorId = getOrCreateVisitorId();
    this.sessionTabId = getOrCreateSessionTabId();

    // Record visit via HTTP once per browser tab session, or fetch snapshot
    this.fetchInitialAndRecordHit();

    // Open single live WebSocket connection for this tab
    this.connectWebSocket();

    // Auto-reconnect promptly when network returns
    window.addEventListener('online', this.handleBrowserOnline);
  }

  private handleBrowserOnline = () => {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.reconnectAttempts = 0;
      this.connectWebSocket();
    }
  };

  private async fetchInitialAndRecordHit() {
    try {
      let alreadyRecorded = false;
      try {
        alreadyRecorded = sessionStorage.getItem(VISIT_RECORDED_KEY) === '1';
      } catch {
        alreadyRecorded = false;
      }

      if (!alreadyRecorded) {
        const res = await fetch('/api/visitors/hit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: this.visitorId,
            sessionTabId: this.sessionTabId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            try {
              sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
            } catch {
              // Ignore storage restrictions
            }
            this.applyServerPayload(data);
            return;
          }
        }
      }

      const res = await fetch('/api/visitors/stats');
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          this.applyServerPayload(data);
        }
      }
    } catch {
      // Offline or transient network error; WebSocket / online listener will recover
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined') return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.stats = { ...this.stats, isConnected: false, isConnecting: false };
      this.emit();
      return;
    }
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.stats = { ...this.stats, isConnecting: true };
    this.emit();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/visitors`;

    try {
      const socket = new WebSocket(wsUrl);
      this.ws = socket;

      socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.stats = { ...this.stats, isConnected: true, isConnecting: false };
        this.emit();

        try {
          socket.send(
            JSON.stringify({
              type: 'join',
              visitorId: this.visitorId,
              sessionTabId: this.sessionTabId,
            })
          );
          try {
            sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
          } catch {
            // Ignore
          }
        } catch {
          // Ignore send errors
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'visitors:stats' && data.payload) {
            this.applyServerPayload(data.payload);
          }
        } catch {
          // Ignore invalid payloads
        }
      };

      socket.onclose = () => {
        if (this.ws === socket) {
          this.ws = null;
        }
        this.stats = { ...this.stats, isConnected: false, isConnecting: false };
        this.emit();
        this.scheduleReconnect();
      };

      socket.onerror = () => {
        // onclose will handle state cleanup and reconnect
      };
    } catch {
      this.stats = { ...this.stats, isConnected: false, isConnecting: false };
      this.emit();
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    const delayMs = Math.min(30000, 1500 * Math.pow(1.6, this.reconnectAttempts));
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, delayMs);
  }
}

export const visitorTracker = new VisitorTrackerSingleton();

export function useVisitorStats(): VisitorStats {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisits: 0,
    uniqueVisitors: 0,
    onlineNow: 0,
    peakOnline: 0,
    isConnected: false,
    isConnecting: true,
    lastUpdated: null,
  });

  useEffect(() => {
    return visitorTracker.subscribe(setStats);
  }, []);

  return stats;
}
