import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationsCenter from './Notifications/NotificationsCenter';
import { companiesAPI } from '../services/api';
import './Layout.css';

const ROLE_LABEL = { master: 'Administrador', manager: 'Gerente', employee: 'Funcionário', financial: 'Financeiro', customer: 'Cliente', owner: 'Dono / Gestor' };

const PAGE_TITLES = {
  '/gestao/dashboard': 'Dashboard',
  '/gestao/appointments': 'Agenda',
  '/gestao/profissionais': 'Profissionais',
  '/gestao/customers': 'Clientes',
  '/gestao/pets': 'Pets',
  '/gestao/inventory': 'Estoque',
  '/gestao/pdv': 'PDV',
  '/gestao/finance': 'Financeiro',
  '/gestao/relatorios': 'Relatórios',
  '/gestao/auditoria': 'Logs de Auditoria',
  '/gestao/codigos': 'Códigos de acesso',
  '/gestao/configuracoes': 'Configurações',
};

export default function Layout({ isCompanyMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [company, setCompany] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const roleLabel = isCompanyMode ? 'Dono / Gestor' : (ROLE_LABEL[user?.role] || user?.role || 'Cliente');

  useEffect(() => {
    if (isCompanyMode) {
      const id = localStorage.getItem('company_id');
      if (id) companiesAPI.getById(id).then((r) => setCompany(r.data)).catch(() => {});
    }
  }, [isCompanyMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (isCompanyMode) {
      navigate('/gestao/dashboard');
    } else {
      navigate('/gestao/dashboard');
    }
  };

  const handleSair = () => {
    if (isCompanyMode) {
      localStorage.removeItem('company_token');
      localStorage.removeItem('company_id');
      localStorage.removeItem('company_role');
      navigate('/company/login');
    } else {
      logout();
      navigate('/');
    }
  };

  const displayName = isCompanyMode ? (company?.name || 'Empresa') : (user?.name || 'Usuário');
  const initials = displayName ? (displayName.split(' ').length >= 2
    ? (displayName.split(' ')[0][0] + displayName.split(' ').slice(-1)[0][0]).toUpperCase()
    : displayName[0].toUpperCase()) : 'U';

  const currentTitle = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Dashboard';

  const menuItems = [
    { path: '/gestao/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/gestao/appointments', label: 'Agenda', icon: '📅' },
    { path: '/gestao/profissionais', label: 'Profissionais', icon: '👤' },
    { path: '/gestao/customers', label: 'Clientes', icon: '👥' },
    { path: '/gestao/pets', label: 'Pets', icon: '🐶' },
    { path: '/gestao/inventory', label: 'Estoque', icon: '📦' },
    { path: '/gestao/pdv', label: 'PDV', icon: '💰' },
    { path: '/gestao/finance', label: 'Financeiro', icon: '📊' },
    { path: '/gestao/relatorios', label: 'Relatórios', icon: '📈' },
    { path: '/gestao/auditoria', label: 'Auditoria', icon: '📋' },
    { path: '/gestao/codigos', label: 'Códigos de acesso', icon: '🎫' },
    { path: '/gestao/configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  /* Floating Tab Bar - só mobile: Home, Pets, Agendar (destaque), Perfil */
  const floatingItems = [
    { path: '/gestao/dashboard', label: 'Home', icon: '🏠' },
    { path: '/gestao/pets', label: 'Pets', icon: '🐾' },
    { path: '/gestao/appointments', label: 'Agendar', icon: '📅', highlight: true },
    { path: '/gestao/configuracoes', label: 'Perfil', icon: '👤' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="layout">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="layout-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={'sidebar' + (sidebarOpen ? ' open' : '')}
      >
        <div className="sidebar-header">
          <h1>🐾 Patatinha</h1>
          <p>Painel de Gestão</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name">{displayName}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>
          <Link to="/gestao/configuracoes#perfil" className="nav-item nav-item-footer">
            <span className="nav-icon">👤</span>
            <span className="nav-label">Perfil</span>
          </Link>
          <button onClick={handleSair} className="logout-btn">
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button
            type="button"
            className="icon-btn layout-back-btn"
            onClick={handleVoltar}
            title="Voltar para a página anterior"
          >
            ←
          </button>
          <button
            type="button"
            className="layout-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h2>{currentTitle}</h2>
          <div className="top-bar-actions">
            <button type="button" className="icon-btn layout-search-btn" title="Buscar">
              🔍
            </button>
            <NotificationsCenter />
            <div className="layout-avatar" title={displayName}>
              {initials}
            </div>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>

      {/* Floating Tab Bar - apenas mobile */}
      <nav className="layout-floating-bar" aria-label="Navegação principal">
        {floatingItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`layout-floating-link ${item.highlight ? 'highlight' : ''} ${isActive(item.path) ? 'active' : ''}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className="layout-floating-icon">{item.icon}</span>
            <span className="layout-floating-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
