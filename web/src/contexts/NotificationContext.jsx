import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const NotificationContext = createContext(null);

function mapFromApi(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.body,
    read: n.status === 'read',
    createdAt: n.created_at,
  };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 50, offset: 0 });
      const list = (res.data?.notifications || []).map(mapFromApi);
      setNotifications(list);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Erro ao carregar notificações:', err);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  return (
    ctx || {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      refresh: () => {},
    }
  );
}
