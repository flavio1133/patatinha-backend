import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
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
const ConfiguracoesPage = lazy(() => import('./pages/ConfiguracoesPage'));
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
      <Layout isCompanyMode={isCompanyOwner} />
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
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="pets" element={<AdminPetsPage />} />
          <Route path="pets/:id" element={<AdminPetDetailPage />} />
          <Route path="pdv" element={<PDVPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
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
