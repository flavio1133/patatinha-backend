import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../../services/api';
import './NotificationsCenter.css';

const TYPE_ICONS = {
  appointment_reminder: '📅',
  pet_ready: '🐶',
  check_in: '✅',
  vaccine_alert: '💉',
  promotion: '🎉',
  payment: '💰',
  low_stock_alert: '⚠️',
  new_appointment: '📅',
  payment_received: '💰',
  subscription_expiring: '⚠️',
  system: '🔔',
};

function formatTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return d.toLocaleDateString('pt-BR');
}

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ limit: 50, offset: 0 });
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  const getIcon = (type) => TYPE_ICONS[type] || '🔔';

  return (
    <div className="notifications-center" ref={containerRef}>
      <button
        type="button"
        className="notifications-center-btn icon-btn"
        onClick={() => setOpen(!open)}
        title="Notificações"
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && (
          <span className="layout-notif-badge notifications-center-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="notifications-center-dropdown">
          <div className="notifications-center-header">
            <h3 className="notifications-center-title">Notificações</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notifications-center-mark-all"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="notifications-center-list">
            {loading ? (
              <div className="notifications-center-empty">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="notifications-center-empty">Nenhuma notificação</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notifications-center-item ${n.status === 'read' ? 'read' : ''}`}
                  onClick={() => n.status !== 'read' && handleMarkAsRead(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && n.status !== 'read') handleMarkAsRead(n.id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="notifications-center-icon">{getIcon(n.type)}</span>
                  <div className="notifications-center-content">
                    <div className="notifications-center-item-title">{n.title}</div>
                    <div className="notifications-center-item-body">{n.body}</div>
                    <div className="notifications-center-item-time">{formatTime(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
