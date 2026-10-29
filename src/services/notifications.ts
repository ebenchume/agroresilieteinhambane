/**
 * AgroResiliente Inhambane - Push Notification & Alert Service
 * Manages Web Notifications API permission, dispatching and in-app alert synchronization.
 */

import { StorageService } from './storage';

export const NotificationsService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  },

  sendPush(title: string, body: string, type: 'climate' | 'market' | 'security' | 'system' = 'system') {
    // Save to in-app notification center
    StorageService.addNotification({
      title,
      message: body,
      type,
    });

    // Also trigger system browser push notification if permitted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification(`AgroResiliente: ${title}`, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser push error:', e);
      }
    }
  }
};
