import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../contexts/CompanyContext';
import { useNotifications } from '../contexts/NotificationContext';
import ClientSearch from './ClientSearch';
import './ClienteLayout.css';

const APP_VERSION = '1.0.0';

const PAGE_TITLES = {
  '/cliente/home': 'Início',
  '/cliente/agendar': 'Agendar',
  '/cliente/agendamentos': 'Agendamentos',
  '/cliente/pets': 'Pets',
  '/cliente/historico': 'Histórico',
  '/cliente/galeria': 'Galeria',
  '/cliente/perfil': 'Perfil',
  '/cliente/notificacoes': 'Notificações',
};

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '?').toUpperCase();
}

function getPageTitle(pathname) {
  if (pathname === '/cliente' || pathname === '/cliente/') return 'Início';
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === path || pathname.startsWith(path + '/')) return title;
  }
  return 'Início';
}

export default function ClienteLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'Cliente';
  const initials = getInitials(user?.name);
  const currentTitle = getPageTitle(location.pathname);

  const logoUrl = company?.logo_url
    ? (company.logo_url.startsWith('http') ? company.logo_url : `${window.location.origin}${company.logo_url}`)
    : null;

  const handleSair = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/cliente/home') return location.pathname === '/cliente/home' || location.pathname === '/cliente';
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { to: '/cliente/home', label: 'Início', icon: '🏠' },
    { to: '/cliente/agendamentos', label: 'Agendamentos', icon: '📅' },
    { to: '/cliente/historico', label: 'Histórico', icon: '📋' },
    { to: '/cliente/galeria', label: 'Fotos', icon: '📷' },
    { to: '/cliente/perfil', label: 'Perfil', icon: '👤' },
  ];

  // Barra inferior (mobile) - 5 itens para cliente
  const bottomItems = [
    { path: '/cliente/home', label: 'Home', icon: '🏠' },
    { path: '/cliente/pets', label: 'Pets', icon: '🐾' },
    { path: '/cliente/agendamentos', label: 'Agendamentos', icon: '📅' },
    { path: '/cliente/historico', label: 'Histórico', icon: '📋' },
    { path: '/cliente/perfil', label: 'Perfil', icon: '👤' },
  ];

  const whatsappNum = (() => {
    const raw = (company?.whatsapp || company?.phone || '').replace(/\D/g, '');
    return raw && (raw.startsWith('55') ? raw : '55' + raw);
  })();

  return (
    <div className="cliente-layout">
      {/* Top bar - mesmo estilo da gestão (tema escuro) */}
      <header className="cliente-top-bar">
        <div className="cliente-top-bar-left">
          <button
            type="button"
            className="cliente-icon-btn cliente-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
          <h2 className="cliente-top-bar-title">{currentTitle}</h2>
        </div>
        <div className="cliente-top-bar-actions">
          <button
            type="button"
            className="cliente-icon-btn"
            onClick={() => setSearchExpanded(!searchExpanded)}
            aria-label="Buscar"
          >
            🔍
          </button>
          <Link to="/cliente/notificacoes" className="cliente-icon-btn cliente-btn-notif" aria-label="Notificações">
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
            >
              <span className="cliente-avatar-initials">{initials}</span>
            </button>
            {dropdownOpen && (
              <div className="cliente-dropdown-menu">
                <div className="cliente-dropdown-user">
                  <strong>{user?.name || 'Cliente'}</strong>
                  <span>{company?.name || 'Pet Shop'}</span>
                </div>
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

      {/* Busca expandida */}
      {searchExpanded && (
        <div className="cliente-search-overlay">
          <ClientSearch
            expanded
            onCollapse={() => setSearchExpanded(false)}
          />
          <button type="button" className="cliente-search-close" onClick={() => setSearchExpanded(false)} aria-label="Fechar">✕</button>
        </div>
      )}

      {/* Drawer menu (mobile) */}
      {menuOpen && (
        <>
          <div className="cliente-drawer-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <aside className="cliente-drawer">
            <div className="cliente-drawer-header">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="cliente-drawer-logo" />
              ) : (
                <span className="cliente-drawer-name">{company?.name || 'Patatinha'}</span>
              )}
              <button type="button" className="cliente-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Fechar">✕</button>
            </div>
            <nav className="cliente-drawer-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={'cliente-drawer-link' + (isActive(item.to) ? ' active' : '')}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="cliente-drawer-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link to="/cliente/agendar" className="cliente-drawer-agendar" onClick={() => setMenuOpen(false)}>
              Agendar serviço
            </Link>
            <Link to="/cliente/codigo" className="cliente-drawer-vincular" onClick={() => setMenuOpen(false)}>
              Vincular pet shop
            </Link>
            {whatsappNum && (
              <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="cliente-drawer-whatsapp">
                Contato WhatsApp
              </a>
            )}
          </aside>
        </>
      )}

      {/* Conteúdo principal - fundo escuro como gestão */}
      <main className="cliente-layout-main">
        {children}
      </main>

      {/* Bottom nav - barra fixa inferior (apenas cliente no mobile) */}
      <nav className="cliente-bottom-bar" aria-label="Navegação principal do cliente">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={'cliente-bottom-link' + (isActive(item.path) ? ' active' : '')}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className="cliente-bottom-icon">{item.icon}</span>
            <span className="cliente-bottom-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
