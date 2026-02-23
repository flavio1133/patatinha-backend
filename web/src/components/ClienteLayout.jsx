import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../contexts/CompanyContext';
import { useNotifications } from '../contexts/NotificationContext';
import ClientSearch from './ClientSearch';
import './ClienteLayout.css';

const APP_VERSION = '1.0.0';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '?').toUpperCase();
}

export default function ClienteLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'Cliente';
  const initials = getInitials(user?.name);

  const logoUrl = company?.logo_url
    ? (company.logo_url.startsWith('http') ? company.logo_url : `${window.location.origin}${company.logo_url}`)
    : null;

  const handleSair = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/cliente/home') return location.pathname === path;
    if (path === '/cliente/agendamentos') return location.pathname === path;
    if (path === '/cliente/agendar') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: '/cliente/home', label: 'Home', icon: '⌂' },
    { to: '/cliente/pets', label: 'Pets', icon: '🐾' },
    { to: '/cliente/agendamentos', label: 'Agendamentos', icon: '📅' },
    { to: '/cliente/historico', label: 'Histórico', icon: '📋' },
    { to: '/cliente/perfil', label: 'Perfil', icon: '👤' },
  ];

  const whatsappNum = (() => {
    const raw = (company?.whatsapp || company?.phone || '').replace(/\D/g, '');
    return raw && (raw.startsWith('55') ? raw : '55' + raw);
  })();

  const sidebarItems = [
    { to: '/cliente/home', label: 'Dashboard', icon: '⌂' },
    { to: '/cliente/pets', label: 'Meus Pets', icon: '🐾' },
    { to: '/cliente/agendamentos', label: 'Agendamentos', icon: '📅' },
    { to: '/cliente/historico', label: 'Histórico', icon: '📋' },
    { to: '/cliente/galeria', label: 'Fotos', icon: '📷' },
    { to: '/cliente/perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <div className="cliente-layout">
      {/* Header - mobile & desktop */}
      <header className="cliente-layout-header">
        <div className="cliente-header-left">
          <Link to="/cliente/home" className="cliente-logo-link">
            {logoUrl ? (
              <img src={logoUrl} alt={company?.name || 'Pet Shop'} className="cliente-logo-img" />
            ) : (
              <span className="cliente-logo-text">{company?.name || 'Patatinha'}</span>
            )}
          </Link>
        </div>

        <div className="cliente-header-center">
          <span className="cliente-greeting desktop-only">Olá, {firstName}</span>
          <div className={'cliente-search-wrap' + (searchExpanded ? ' expanded' : '')}>
            <ClientSearch
              expanded={searchExpanded}
              onExpand={() => setSearchExpanded(true)}
              onCollapse={() => setSearchExpanded(false)}
            />
            {!searchExpanded && (
              <button
                type="button"
                className="cliente-search-toggle mobile-only"
                onClick={() => setSearchExpanded(true)}
                aria-label="Abrir busca"
              >
                🔍
              </button>
            )}
          </div>
        </div>

        <div className="cliente-header-right">
          {searchExpanded && (
            <button
              type="button"
              className="cliente-search-close mobile-only"
              onClick={() => setSearchExpanded(false)}
              aria-label="Fechar busca"
            >
              ✕
            </button>
          )}
          <Link to="/cliente/notificacoes" className="cliente-btn-notif" aria-label="Notificações">
            <span className="cliente-notif-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="cliente-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>

          <div className="cliente-avatar-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="cliente-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="cliente-avatar-initials">{initials}</span>
            </button>
            {dropdownOpen && (
              <div className="cliente-dropdown-menu">
                <Link to="/cliente/perfil" className="cliente-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Perfil
                </Link>
                <Link to="/cliente/perfil#config" className="cliente-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Configurações
                </Link>
                <button type="button" className="cliente-dropdown-item cliente-dropdown-sair" onClick={handleSair}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="cliente-layout-body">
        {/* Sidebar - desktop only */}
        <aside className="cliente-sidebar desktop-only">
          <Link to="/cliente/home" className="cliente-sidebar-logo">
            {logoUrl ? (
              <img src={logoUrl} alt="" />
            ) : (
              <span>{company?.name || 'Patatinha'}</span>
            )}
          </Link>
          <nav className="cliente-sidebar-nav">
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={'cliente-sidebar-link' + (isActive(item.to) ? ' active' : '')}
              >
                <span className="cliente-sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/cliente/agendar"
            className={'cliente-sidebar-agendar' + (isActive('/cliente/agendar') ? ' active' : '')}
          >
            Agendar
          </Link>
          <Link to="/cliente/codigo" className="cliente-sidebar-vincular">
            Vincular pet shop
          </Link>
        </aside>

        {/* Main content */}
        <main className="cliente-layout-main">
          {children}
        </main>
      </div>

      {/* Bottom nav - mobile only */}
      <nav className="cliente-bottom-nav mobile-only">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={'cliente-bottom-link' + (isActive(item.to) ? ' active' : '')}
          >
            <span className="cliente-bottom-icon">{item.icon}</span>
            <span className="cliente-bottom-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <footer className="cliente-layout-footer">
        {whatsappNum && (
          <a
            href={`https://wa.me/${whatsappNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cliente-footer-whatsapp"
          >
            Contato WhatsApp
          </a>
        )}
        <Link to="/termos" className="cliente-footer-terms">Termos de uso</Link>
        <span className="cliente-footer-version">v{APP_VERSION}</span>
      </footer>
    </div>
  );
}
