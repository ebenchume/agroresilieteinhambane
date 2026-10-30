/**
 * AgroResiliente Inhambane - Storage & Persistence Service
 * Implements offline-first caching for users, credentials, session, market prices, and audit logs.
 */

import { User, Session, AuditLog, AppNotification, MarketPrice } from '../types/auth';

const STORAGE_USERS = 'agro_users_v2';
const STORAGE_SESSION = 'agro_session_v2';
const STORAGE_LOGS = 'agro_audit_logs_v2';
const STORAGE_NOTIFICATIONS = 'agro_notifications_v2';
const STORAGE_MARKET_PRICES = 'agro_market_prices_v2';
const STORAGE_OFFLINE_QUEUE = 'agro_offline_queue_v2';

// Initial pre-seeded demo users for immediate testing and verification
const DEFAULT_USERS: User[] = [
  {
    id: 'usr_maria_01',
    name: 'Maria João Tembe',
    phone: '841234567',
    email: 'maria.joao@exemplo.com',
    zone: 'Homoíne-Sede',
    crop: 'Milho',
    type: 'Mulher chefe de família',
    password: 'Password123!',
    plan: 'Premium',
    createdAt: '2026-01-15T08:30:00Z',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP', // standard test base32 secret
    biometricRegistered: true,
    biometricCredentialId: 'cred_bio_maria_touchid_01',
    biometricDeviceName: 'Sensor Biométrico (Touch ID / Android Fingerprint)',
    backupCodes: ['8421-9920', '3128-4491', '7503-1182', '9934-2051'],
    lastLoginAt: '2026-10-26T14:20:00Z',
  },
  {
    id: 'usr_arsenio_02',
    name: 'Arsénio Matsinhe',
    phone: '876473432',
    email: 'ebenchume@sapo.mz',
    zone: 'Homoíne-Sede',
    crop: 'Mandioca',
    type: 'Extensionista',
    password: 'Agro2026!',
    plan: 'Premium',
    createdAt: '2025-11-10T10:00:00Z',
    twoFactorEnabled: false,
    biometricRegistered: true,
    biometricCredentialId: 'cred_bio_arsenio_passkey_02',
    biometricDeviceName: 'Passkey Hardware FIDO2',
    backupCodes: ['4491-3829', '1092-8834', '5520-9182', '6639-4410'],
    lastLoginAt: '2026-10-27T08:15:00Z',
  },
  {
    id: 'usr_joaquim_03',
    name: 'Joaquim Cossa',
    phone: '829876543',
    email: 'joaquim.cossa@exemplo.com',
    zone: 'Maculuve',
    crop: 'Amendoim',
    type: 'Familiar',
    password: 'SenhaProdutor1!',
    plan: 'Gratuita',
    createdAt: '2026-03-20T11:45:00Z',
    twoFactorEnabled: false,
    biometricRegistered: false,
    backupCodes: ['1234-5678', '8765-4321', '9876-1234', '5432-8765'],
    lastLoginAt: '2026-10-25T16:00:00Z',
  }
];

// Offline-cached market prices
const INITIAL_MARKET_PRICES: MarketPrice[] = [
  { crop: 'Mandioca', market: 'Homoíne-Sede', minPrice: 16, maxPrice: 20, unit: 'MT/kg', trend: 'stable', lastUpdated: 'Hoje, 07:00' },
  { crop: 'Milho', market: 'Maxixe', minPrice: 28, maxPrice: 35, unit: 'MT/kg', trend: 'up', lastUpdated: 'Hoje, 07:30' },
  { crop: 'Amendoim', market: 'Inhambane-Cidade', minPrice: 60, maxPrice: 75, unit: 'MT/kg', trend: 'up', lastUpdated: 'Hoje, 06:45' },
  { crop: 'Feijão nhemba', market: 'Massinga', minPrice: 39, maxPrice: 49, unit: 'MT/kg', trend: 'down', lastUpdated: 'Hoje, 08:00' },
  { crop: 'Caju', market: 'Homoíne-Sede', minPrice: 35, maxPrice: 45, unit: 'MT/kg', trend: 'stable', lastUpdated: 'Ontem, 16:00' },
  { crop: 'Mapira', market: 'Maxixe', minPrice: 22, maxPrice: 28, unit: 'MT/kg', trend: 'stable', lastUpdated: 'Hoje, 07:15' },
  { crop: 'Hortícolas', market: 'Inhambane-Cidade', minPrice: 35, maxPrice: 60, unit: 'MT/kg', trend: 'down', lastUpdated: 'Hoje, 08:30' },
  { crop: 'Batata-doce', market: 'Homoíne-Sede', minPrice: 14, maxPrice: 20, unit: 'MT/kg', trend: 'stable', lastUpdated: 'Hoje, 06:00' },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_01',
    title: 'Alerta Meteorológico (Homoíne)',
    message: 'Previsão de precipitação moderada nas próximas 36 horas em Homoíne-Sede e Nhanombe. Recomendada drenagem preventiva.',
    type: 'climate',
    timestamp: 'Há 25 minutos',
    read: false,
    actionLabel: 'Ver Detalhes do Clima'
  },
  {
    id: 'notif_02',
    title: 'Preço em Alta: Milho em Maxixe',
    message: 'O milho atingiu 35 MT/kg no mercado de Maxixe (+15% face à média semanal). Boa janela para comercialização.',
    type: 'market',
    timestamp: 'Há 2 horas',
    read: false,
    actionLabel: 'Consultar Cotações'
  },
  {
    id: 'notif_03',
    title: 'Segurança da Conta',
    message: 'Autenticação multifator (2FA) e suporte biométrico ativos com sucesso na sua conta de produtor.',
    type: 'security',
    timestamp: 'Ontem',
    read: true,
  }
];

export const StorageService = {
  // Initialize storage with defaults if empty
  init() {
    try {
      if (!localStorage.getItem(STORAGE_USERS)) {
        localStorage.setItem(STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
      }
      if (!localStorage.getItem(STORAGE_MARKET_PRICES)) {
        localStorage.setItem(STORAGE_MARKET_PRICES, JSON.stringify(INITIAL_MARKET_PRICES));
      }
      if (!localStorage.getItem(STORAGE_NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
      if (!localStorage.getItem(STORAGE_LOGS)) {
        localStorage.setItem(STORAGE_LOGS, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('Storage initialisation error:', e);
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users: User[]) {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  findUser(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase().replace(/\s/g, '');
    const users = this.getUsers();
    return users.find(u => {
      const p = u.phone.replace(/\s/g, '').toLowerCase();
      const em = u.email.trim().toLowerCase();
      return p === clean || em === clean || ('+258' + p === clean);
    });
  },

  saveUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.saveUsers(users);
    
    // Also update session if it matches current user
    const session = this.getSession();
    if (session && session.user.id === user.id) {
      this.setSession({ ...session, user });
    }
    return user;
  },

  // Session
  getSession(): Session | null {
    try {
      const data = localStorage.getItem(STORAGE_SESSION);
      if (!data) return null;
      const session: Session = JSON.parse(data);
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  setSession(session: Session | null) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_SESSION);
      }
    } catch (e) {
      console.error('Session write error:', e);
    }
  },

  clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logAction(userId: string, action: string, status: 'success' | 'failed' | 'warning', details?: string) {
    try {
      const logs = this.getAuditLogs();
      const newLog: AuditLog = {
        id: 'log_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        userId,
        action,
        status,
        details,
        timestamp: new Date().toISOString(),
        ip: '197.235.12.84 (Inhambane, MZ)',
        device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvel' : 'Navegador Web Desktop') : 'Web'
      };
      // Keep last 40 logs
      logs.unshift(newLog);
      if (logs.length > 40) logs.pop();
      localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Logging error:', e);
    }
  },

  // Market Prices (Offline Cache)
  getMarketPrices(): MarketPrice[] {
    try {
      const data = localStorage.getItem(STORAGE_MARKET_PRICES);
      return data ? JSON.parse(data) : INITIAL_MARKET_PRICES;
    } catch {
      return INITIAL_MARKET_PRICES;
    }
  },

  // Notifications
  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    try {
      const list = this.getNotifications();
      const item: AppNotification = {
        ...notif,
        id: 'notif_' + Date.now().toString(36),
        timestamp: 'Agora mesmo',
        read: false,
      };
      list.unshift(item);
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(list));
      return item;
    } catch {
      return null;
    }
  },

  markAllNotificationsRead() {
    try {
      const list = this.getNotifications().map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_NOTIFICATIONS, JSON.stringify(list));
    } catch {}
  },

  // Saved Agro-Resilient Tips (Caderno de Campo)
  getSavedAgroTips(): string[] {
    try {
      const data = localStorage.getItem('agro_saved_tips_v1');
      return data ? JSON.parse(data) : ['tip-milho-consociacao', 'tip-solo-zai'];
    } catch {
      return ['tip-milho-consociacao', 'tip-solo-zai'];
    }
  },

  toggleSavedAgroTip(tipId: string): boolean {
    try {
      const saved = this.getSavedAgroTips();
      const index = saved.indexOf(tipId);
      let isSaved = false;
      if (index >= 0) {
        saved.splice(index, 1);
        isSaved = false;
      } else {
        saved.push(tipId);
        isSaved = true;
      }
      localStorage.setItem('agro_saved_tips_v1', JSON.stringify(saved));
      return isSaved;
    } catch {
      return false;
    }
  },

  // Helper to generate 2FA backup codes
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 6; i++) {
      const part1 = Math.floor(1000 + Math.random() * 9000).toString();
      const part2 = Math.floor(1000 + Math.random() * 9000).toString();
      codes.push(`${part1}-${part2}`);
    }
    return codes;
  }
};

// Auto-run init
StorageService.init();
