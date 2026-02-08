import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { notifications as notifApi } from '../api/endpoints';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { subscribe } = useWebSocket();
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notifApi.list();
      const raw: any = response.data.data;
      setNotifications(Array.isArray(raw) ? raw : raw?.notifications || []);
      const countResp = await notifApi.getUnreadCount();
      setUnreadCount(countResp.data.data?.count || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const unsub = subscribe('notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return unsub;
  }, [subscribe]);

  async function markRead(id: string) {
    await notifApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllRead() {
    await notifApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
