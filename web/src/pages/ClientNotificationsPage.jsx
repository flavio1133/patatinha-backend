import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import './ClientNotificationsPage.css';

function formatDate(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'Agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
  if (diff < 86400000) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Ontem';
  return date.toLocaleDateString('pt-BR');
}

export default function ClientNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="cliente-page client-notifications-page">
      <header className="cliente-page-header">
        <h1>Notificações</h1>
        <p className="cliente-sub">
          {unreadCount > 0
            ? `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`
            : 'Todas visualizadas'}
        </p>
      </header>

      {notifications.length > 0 && unreadCount > 0 && (
        <button type="button" className="client-notif-mark-all" onClick={markAllAsRead}>
          Marcar todas como lidas
        </button>
      )}

      {notifications.length === 0 ? (
        <div className="client-notifications-empty">
          <p>Nenhuma notificação.</p>
          <Link to="/cliente/home">Voltar ao início</Link>
        </div>
      ) : (
        <ul className="client-notifications-list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={'client-notification-item' + (n.read ? ' read' : '')}
              onClick={() => !n.read && markAsRead(n.id)}
              onKeyDown={(e) => e.key === 'Enter' && !n.read && markAsRead(n.id)}
              role="button"
              tabIndex={0}
              aria-label={n.title}
            >
              <div className="client-notif-content">
                <span className="client-notif-title">{n.title}</span>
                <p className="client-notif-message">{n.message}</p>
                <span className="client-notif-date">{formatDate(n.createdAt)}</span>
              </div>
              {!n.read && <span className="client-notif-dot" aria-hidden />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
