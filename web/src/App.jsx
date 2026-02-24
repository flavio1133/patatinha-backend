import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useAdmin } from './contexts/AdminContext';
import Layout from './components/Layout';
import ClienteLayout from './components/ClienteLayout';
import PageLoader from './components/PageLoader';
import { CompanyProvider } from './contexts/CompanyContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ClientProvider } from './contexts/ClientContext';
import { BookingProvider } from './contexts/BookingContext';

/* Lazy: páginas carregadas só quando a rota é acessada (gestão mais leve) */
const HomePage = lazy(() => import('./pages/HomePage'));
const EmpresaCadastroPage = lazy(() => import('./pages/EmpresaCadastroPage'));
const EmpresaLoginPage = lazy(() => import('./pages/EmpresaLoginPage'));
const EmpresaDashboardPage = lazy(() => import('./pages/EmpresaDashboardPage'));
const TesteLoginsPage = lazy(() => import('./pages/TesteLoginsPage'));
const SubscriptionPlansPage = lazy(() => import('./pages/SubscriptionPlansPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage'));
const CompanyInvitationCodesPage = lazy(() => import('./pages/CompanyInvitationCodesPage'));
const ClienteEnterCodePage = lazy(() => import('./pages/ClienteEnterCodePage'));
const ClienteLoginPage = lazy(() => import('./pages/ClienteLoginPage'));
const ClienteCadastroPage = lazy(() => import('./pages/ClienteCadastroPage'));
const GestaoLoginPage = lazy(() => import('./pages/GestaoLoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const AdminPetsPage = lazy(() => import('./pages/AdminPetsPage'));
const AdminPetDetailPage = lazy(() => import('./pages/AdminPetDetailPage'));
const PDVPage = lazy(() => import('./pages/PDVPage'));
const RelatoriosPage = lazy(() => import('./pages/RelatoriosPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const MasterDashboardPage = lazy(() => import('./pages/MasterDashboardPage'));
const MasterLojasPage = lazy(() => import('./pages/MasterLojasPage'));
const MasterAssinaturasPage = lazy(() => import('./pages/MasterAssinaturasPage'));
const MasterFeatureTogglePage = lazy(() => import('./pages/MasterFeatureTogglePage'));
const MasterTicketsPage = lazy(() => import('./pages/MasterTicketsPage'));
const MasterEquipePage = lazy(() => import('./pages/MasterEquipePage'));
const MasterGestoresPage = lazy(() => import('./pages/MasterGestoresPage'));
const SupportTicketsPage = lazy(() => import('./pages/SupportTicketsPage'));
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'));
const ProfissionaisPage = lazy(() => import('./pages/ProfissionaisPage'));
const ClienteDashboardPage = lazy(() => import('./pages/ClienteDashboardPage'));
const ClientBookingFlow = lazy(() => import('./pages/ClientBookingFlow'));
const ClientAppointmentsPage = lazy(() => import('./pages/ClientAppointmentsPage'));
const ClientNotificationsPage = lazy(() => import('./pages/ClientNotificationsPage'));
const ClientePetsPage = lazy(() => import('./pages/ClientePetsPage'));
const ClientePetFormPage = lazy(() => import('./pages/ClientePetFormPage'));
const ClientePetDetailPage = lazy(() => import('./pages/ClientePetDetailPage'));
const ClienteHistoricoPage = lazy(() => import('./pages/ClienteHistoricoPage'));
const ClienteGaleriaPage = lazy(() => import('./pages/ClienteGaleriaPage'));
const ClientePerfilPage = lazy(() => import('./pages/ClientePerfilPage'));

// Proteção e layout para Gestão (auth OU dono da empresa com company_token)
function GestaoLayout() {
  const { isAuthenticated, user } = useAuth();
  const companyToken = localStorage.getItem('company_token');
  const companyRole = localStorage.getItem('company_role');
  const companyId = localStorage.getItem('company_id');
  const isCompanyOwner = !!(companyToken && (companyRole === 'owner' || companyId));

  if (!isCompanyOwner && !isAuthenticated) {
    return <Navigate to="/gestao/login" replace />;
  }
  if (!isCompanyOwner && !['super_admin', 'master', 'manager', 'employee', 'financial'].includes(user?.role)) {
    return <Navigate to="/cliente/home" replace />;
  }

  return (
    <AdminProvider>
      <Layout isCompanyMode={isCompanyOwner} isSuperAdmin={user?.role === 'super_admin'} />
    </AdminProvider>
  );
}

// Rota protegida para Dashboard da Empresa
function CompanyDashboardRoute() {
  const token = localStorage.getItem('company_token');
  if (!token) {
    return <Navigate to="/company/login" replace />;
  }
  return <EmpresaDashboardPage />;
}

function CompanySubscriptionRoute() {
  const token = localStorage.getItem('company_token');
  if (!token) return <Navigate to="/company/login" replace />;
  return <SubscriptionManagementPage />;
}

function CompanyCodesRoute() {
  const token = localStorage.getItem('company_token');
  if (!token) return <Navigate to="/company/login" replace />;
  return <CompanyInvitationCodesPage />;
}

// Super Admin sem company_token: ao acessar /gestao/dashboard vai para o painel master
function DashboardOrMasterRedirect() {
  const { user } = useAuth();
  const companyToken = localStorage.getItem('company_token');
  const isSuperAdmin = user?.role === 'super_admin';
  if (isSuperAdmin && !companyToken) return <Navigate to="/gestao/master" replace />;
  return <DashboardPage />;
}

// Guard de módulo (Feature Toggle) para rotas da empresa
function FeatureGuard({ feature, children }) {
  const { features } = useAdmin();
  const companyToken = localStorage.getItem('company_token');
  // Se não estiver em contexto de empresa, libera (Super Admin / Staff)
  if (!companyToken) return children;
  if (features && features[feature] === false) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Upgrade necessário</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 16 }}>
          Este módulo não está habilitado para a sua loja. Fale com o suporte ou com o administrador da plataforma para ativar o acesso.
        </p>
      </div>
    );
  }
  return children;
}

// Rotas protegidas para Cliente
function ClienteRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" />;
  }

  // Gestor/admin tentando acessar Ã¡rea do cliente: redireciona para gestÃ£o (nÃ£o para login)
  if (user?.role !== 'customer' && user?.role !== 'client') {
    return <Navigate to="/gestao/dashboard" replace />;
  }

  return (
    <CompanyProvider>
      <NotificationProvider>
        <ClientProvider>
          <BookingProvider>
            <ClienteLayout>
              <Routes>
                <Route path="home" element={<ClienteDashboardPage />} />
                <Route path="agendar" element={<ClientBookingFlow />} />
                <Route path="agendamentos" element={<ClientAppointmentsPage />} />
                <Route path="notificacoes" element={<ClientNotificationsPage />} />
                <Route path="pets" element={<ClientePetsPage />} />
                <Route path="pets/novo" element={<ClientePetFormPage />} />
                <Route path="pets/:id/editar" element={<ClientePetFormPage />} />
                <Route path="pets/:id" element={<ClientePetDetailPage />} />
                <Route path="historico" element={<ClienteHistoricoPage />} />
                <Route path="galeria" element={<ClienteGaleriaPage />} />
                <Route path="perfil" element={<ClientePerfilPage />} />
                <Route index element={<Navigate to="/cliente/home" replace />} />
                <Route path="*" element={<Navigate to="/cliente/home" replace />} />
              </Routes>
            </ClienteLayout>
          </BookingProvider>
        </ClientProvider>
      </NotificationProvider>
    </CompanyProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Rotas pÃºblicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cadastro-empresa" element={<EmpresaCadastroPage />} />
        <Route path="/company/login" element={<EmpresaLoginPage />} />
        <Route path="/teste-logins" element={<TesteLoginsPage />} />
        <Route path="/assinatura" element={<SubscriptionPlansPage />} />
        <Route path="/assinatura/checkout" element={<CheckoutPage />} />
        <Route path="/assinatura/sucesso" element={<PaymentSuccessPage />} />
        
        {/* Rotas de login separadas */}
        <Route path="/cliente/codigo" element={<ClienteEnterCodePage />} />
        <Route path="/cliente/login" element={<ClienteLoginPage />} />
        <Route path="/cliente/cadastro" element={<ClienteCadastroPage />} />
        <Route path="/gestao/login" element={<GestaoLoginPage />} />
        
        {/* Rotas protegidas - Gestão (aninhadas com Layout + Outlet) */}
        <Route path="/gestao" element={<GestaoLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOrMasterRedirect />} />
          <Route path="master" element={<MasterDashboardPage />} />
          <Route path="lojas" element={<MasterLojasPage />} />
          <Route path="assinaturas-master" element={<MasterAssinaturasPage />} />
          <Route path="feature-toggle" element={<MasterFeatureTogglePage />} />
          <Route path="tickets" element={<MasterTicketsPage />} />
          <Route path="equipe-master" element={<MasterEquipePage />} />
          <Route path="gestores" element={<MasterGestoresPage />} />
          <Route path="suporte" element={<SupportTicketsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="profissionais" element={<ProfissionaisPage />} />
          <Route
            path="inventory"
            element={(
              <FeatureGuard feature="inventory">
                <InventoryPage />
              </FeatureGuard>
            )}
          />
          <Route path="pets" element={<AdminPetsPage />} />
          <Route path="pets/:id" element={<AdminPetDetailPage />} />
          <Route
            path="pdv"
            element={(
              <FeatureGuard feature="pdv">
                <PDVPage />
              </FeatureGuard>
            )}
          />
          <Route
            path="finance"
            element={(
              <FeatureGuard feature="finance">
                <FinancePage />
              </FeatureGuard>
            )}
          />
          <Route
            path="relatorios"
            element={(
              <FeatureGuard feature="reports">
                <RelatoriosPage />
              </FeatureGuard>
            )}
          />
          <Route path="auditoria" element={<AuditLogsPage />} />
          <Route path="codigos" element={<CompanyInvitationCodesPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        
        {/* Rotas protegidas - Cliente */}
        <Route path="/cliente/*" element={<ClienteRoutes />} />
        
        {/* Rotas protegidas - Empresa (pet shop) */}
        <Route path="/company/dashboard" element={<CompanyDashboardRoute />} />
        <Route path="/company/assinatura" element={<CompanySubscriptionRoute />} />
        <Route path="/company/codigos" element={<CompanyCodesRoute />} />
        
        {/* Fallback - redirecionar para home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
