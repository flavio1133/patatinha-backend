import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem('admin_preferences');
    return stored ? JSON.parse(stored) : { theme: 'light', pageSize: 10 };
  });
  const [features, setFeatures] = useState({
    pdv: true,
    finance: true,
    inventory: true,
    reports: true,
  });

  useEffect(() => {
    localStorage.setItem('admin_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = useCallback((updates) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: Date.now(), read: false, createdAt: new Date(), ...notification },
      ...prev,
    ]);
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        preferences,
        updatePreferences,
        features,
        setFeatures,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  return (
    ctx || {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markNotificationAsRead: () => {},
      markAllNotificationsAsRead: () => {},
      preferences: { theme: 'light', pageSize: 10 },
      updatePreferences: () => {},
      features: { pdv: true, finance: true, inventory: true, reports: true },
      setFeatures: () => {},
    }
  );
}