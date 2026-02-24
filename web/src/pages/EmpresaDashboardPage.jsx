import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companiesAPI } from '../services/api';
import './EmpresaDashboardPage.css';

export default function EmpresaDashboardPage() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('company_id');
    if (!id) {
      setError('Sessão inválida. Faça login novamente.');
      setLoading(false);
      return;
    }
    companiesAPI.getById(id)
      .then((res) => setCompany(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_id');
    localStorage.removeItem('company_role');
    window.location.href = '/company/login';
  };

  const role = localStorage.getItem('company_role') || 'owner';
  const roleLabels = { owner: 'Dono / Gestor', vendedor: 'Vendedor', atendente: 'Atendente', tosador: 'Tosador', gerente_loja: 'Gerente da loja' };

  if (loading) {
    return (
      <div className="empresa-dashboard-page">
        <div className="empresa-dashboard-loading">Carregando...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="empresa-dashboard-page">
        <div className="empresa-dashboard-error">
          <p>{error || 'Empresa não encontrada'}</p>
          <Link to="/company/login">Fazer login</Link>
        </div>
      </div>
    );
  }

  const trialEnd = company.trial_end ? new Date(company.trial_end) : null;
  const trialDaysLeft = trialEnd ? Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="empresa-dashboard-page">
      <header className="empresa-dashboard-header">
        <div className="empresa-dashboard-brand">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="empresa-logo" />
          ) : (
            <span className="empresa-logo-placeholder">🐾</span>
          )}
          <div>
            <h1>{company.name}</h1>
            <p className="empresa-subtitle">Painel da empresa · {roleLabels[role] || role}</p>
          </div>
        </div>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main className="empresa-dashboard-main">
        <section className="welcome-card">
          <h2>Bem-vindo(a)!</h2>
          <p>{role === 'owner' ? 'Cadastro realizado com sucesso. Aqui você gerencia sua pet shop.' : `Você está logado como ${roleLabels[role] || role}. Acesse as funcionalidades permitidas.`}</p>
          <Link to="/gestao/dashboard" className="btn-painel-gestao">
            Abrir painel de gestão →
          </Link>
        </section>

        {company.subscription_status === 'trial' && (
          <section className="trial-card">
            <h3>🎁 Período de teste</h3>
            <p>Você tem <strong>15 dias</strong> de teste grátis.</p>
            <p><Link to="/assinatura" style={{ color: '#ea580c', fontWeight: 600 }}>Escolher plano</Link> para continuar após o trial</p>
            {trialEnd && (
              <p className="trial-date">
                Expira em: {trialEnd.toLocaleDateString('pt-BR')}
                {trialDaysLeft > 0 && (
                  <span className="trial-days"> ({trialDaysLeft} dias restantes)</span>
                )}
              </p>
            )}
          </section>
        )}

        {role === 'owner' && (
        <section className="actions-grid">
              <Link to="/company/assinatura" className="action-card">
                <span className="action-icon">💳</span>
                <h4>Minha assinatura</h4>
                <p>Plano, pagamentos e cobrança</p>
              </Link>
              <Link to="/cadastro-empresa" className="action-card">
                <span className="action-icon">✏️</span>
                <h4>Completar cadastro</h4>
                <p>Atualizar dados da empresa</p>
              </Link>
              <Link to="/company/codigos" className="action-card">
                <span className="action-icon">🎫</span>
                <h4>Códigos de acesso</h4>
                <p>Gerar e compartilhar códigos para clientes</p>
              </Link>
        </section>
        )}

        <section className="company-summary">
          <h3>Dados da empresa</h3>
          <div className="summary-grid">
            <div><strong>CNPJ:</strong> {company.cnpj}</div>
            <div><strong>E-mail:</strong> {company.email}</div>
            <div><strong>Telefone:</strong> {company.phone}</div>
            <div><strong>Endereço:</strong> {company.address}, {company.address_number} - {company.neighborhood}</div>
            <div><strong>Cidade:</strong> {company.city}/{company.state}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
