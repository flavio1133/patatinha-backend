import { Routes, Route, Navigate, useRoutes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import EmpresaCadastroPage from './pages/EmpresaCadastroPage';
import EmpresaLoginPage from './pages/EmpresaLoginPage';
import EmpresaDashboardPage from './pages/EmpresaDashboardPage';
import TesteLoginsPage from './pages/TesteLoginsPage';
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import CompanyInvitationCodesPage from './pages/CompanyInvitationCodesPage';
import ClienteEnterCodePage from './pages/ClienteEnterCodePage';
import ClienteLoginPage from './pages/ClienteLoginPage';
import ClienteCadastroPage from './pages/ClienteCadastroPage';
import GestaoLoginPage from './pages/GestaoLoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import InventoryPage from './pages/InventoryPage';
import FinancePage from './pages/FinancePage';
import AdminPetsPage from './pages/AdminPetsPage';
import AdminPetDetailPage from './pages/AdminPetDetailPage';
import PDVPage from './pages/PDVPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import ClienteDashboardPage from './pages/ClienteDashboardPage';
import ClientBookingFlow from './pages/ClientBookingFlow';
import ClientAppointmentsPage from './pages/ClientAppointmentsPage';
import ClientNotificationsPage from './pages/ClientNotificationsPage';
import ClientePetsPage from './pages/ClientePetsPage';
import ClientePetFormPage from './pages/ClientePetFormPage';
import ClientePetDetailPage from './pages/ClientePetDetailPage';
import ClienteHistoricoPage from './pages/ClienteHistoricoPage';
import ClienteGaleriaPage from './pages/ClienteGaleriaPage';
import ClientePerfilPage from './pages/ClientePerfilPage';
import Layout from './components/Layout';
import ClienteLayout from './components/ClienteLayout';
import { CompanyProvider } from './contexts/CompanyContext';
import { AdminProvider } from './contexts/AdminContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ClientProvider } from './contexts/ClientContext';
import { BookingProvider } from './contexts/BookingContext';

// Rotas protegidas para Gestão (auth OU dono da empresa com company_token)
function GestaoRoutes() {
  const location = useLocation();
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

  const gestaoRoutes = [
    { path: '/gestao', element: <Navigate to="/gestao/dashboard" replace /> },
    { path: '/gestao/dashboard', element: <DashboardPage /> },
    { path: '/gestao/customers', element: <CustomersPage /> },
    { path: '/gestao/customers/:id', element: <CustomerDetailPage /> },
    { path: '/gestao/appointments', element: <AppointmentsPage /> },
    { path: '/gestao/inventory', element: <InventoryPage /> },
    { path: '/gestao/pets', element: <AdminPetsPage /> },
    { path: '/gestao/pets/:id', element: <AdminPetDetailPage /> },
    { path: '/gestao/pdv', element: <PDVPage /> },
    { path: '/gestao/finance', element: <FinancePage /> },
    { path: '/gestao/relatorios', element: <RelatoriosPage /> },
    { path: '/gestao/codigos', element: <CompanyInvitationCodesPage /> },
    { path: '/gestao/configuracoes', element: <ConfiguracoesPage /> },
    { path: '/gestao/*', element: <Navigate to="/gestao/dashboard" replace /> },
  ];

  const content = useRoutes(gestaoRoutes);

  return (
    <AdminProvider>
      <Layout isCompanyMode={isCompanyOwner}>
        {content}
      </Layout>
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
        
        {/* Rotas protegidas - GestÃ£o */}
        <Route path="/gestao/*" element={<GestaoRoutes />} />
        
        {/* Rotas protegidas - Cliente */}
        <Route path="/cliente/*" element={<ClienteRoutes />} />
        
        {/* Rotas protegidas - Empresa (pet shop) */}
        <Route path="/company/dashboard" element={<CompanyDashboardRoute />} />
        <Route path="/company/assinatura" element={<CompanySubscriptionRoute />} />
        <Route path="/company/codigos" element={<CompanyCodesRoute />} />
        
        {/* Fallback - redirecionar para home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
