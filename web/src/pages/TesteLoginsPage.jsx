import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { companiesAPI } from '../services/api';
import './TesteLoginsPage.css';

/**
 * Página de teste de logins - facilita verificar cada tipo de usuário
 */
export default function TesteLoginsPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAuthLogin = async (email, password, tipo) => {
    setLoading(true);
    setResult('');
    localStorage.removeItem('company_token');
    localStorage.removeItem('company_id');
    localStorage.removeItem('company_role');
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('auth_token', token);
      setResult(`✅ ${tipo} - Login OK! Redirecionando...`);
      const target = ['master', 'manager', 'employee', 'financial'].includes(user?.role) ? '/gestao/dashboard' : '/cliente/home';
      setTimeout(() => { window.location.href = target; }, 600);
    } catch (err) {
      setResult(`❌ ${tipo} - Falhou: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const testCompanyLogin = async (email, password, tipo) => {
    setLoading(true);
    setResult('');
    localStorage.removeItem('auth_token');
    try {
      const res = await companiesAPI.login(email, password);
      const { token, company, role } = res.data;
      localStorage.setItem('company_token', token);
      localStorage.setItem('company_id', company.id);
      localStorage.setItem('company_role', role || 'owner');
      setResult(`✅ ${tipo} - Login OK! Redirecionando...`);
      setTimeout(() => { window.location.href = '/company/dashboard'; }, 600);
    } catch (err) {
      setResult(`❌ ${tipo} - Falhou: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="teste-logins-page">
      <div className="teste-logins-container">
        <h1>Teste de logins</h1>
        <p className="teste-logins-subtitle">Clique em um botão para testar o login automaticamente</p>

        <section className="teste-section">
          <h2>1. Administradores da plataforma</h2>
          <p>Painel de gestão (TI/suporte) — <Link to="/gestao/login">/gestao/login</Link></p>
          <div className="teste-buttons">
            <button type="button" onClick={() => testAuthLogin('super@patatinha.com', 'Super@2026', 'Super Admin')} disabled={loading}>
              Super Admin
            </button>
            <button type="button" onClick={() => testAuthLogin('admin@patatinha.com', 'Admin@2026', 'Master')} disabled={loading}>
              Admin Master
            </button>
            <button type="button" onClick={() => testAuthLogin('gerente@patatinha.com', 'Gerente@2026', 'Gerente')} disabled={loading}>
              Gerente
            </button>
            <button type="button" onClick={() => testAuthLogin('funcionario@patatinha.com', 'Func@2026', 'Funcionário')} disabled={loading}>
              Funcionário
            </button>
            <button type="button" onClick={() => testAuthLogin('financeiro@patatinha.com', 'Financeiro@2026', 'Financeiro')} disabled={loading}>
              Financeiro
            </button>
          </div>
        </section>

        <section className="teste-section">
          <h2>2. Empresa (pet shop)</h2>
          <p>Login da empresa — <Link to="/company/login">/company/login</Link></p>
          <div className="teste-buttons">
            <button type="button" onClick={() => testCompanyLogin('contato@patatinha.com', 'demo123', 'Dono')} disabled={loading}>
              Dono
            </button>
            <button type="button" onClick={() => testCompanyLogin('vendedor@patatinha.com', 'vendedor123', 'Vendedor')} disabled={loading}>
              Vendedor
            </button>
            <button type="button" onClick={() => testCompanyLogin('atendente@patatinha.com', 'atendente123', 'Atendente')} disabled={loading}>
              Atendente
            </button>
          </div>
        </section>

        <section className="teste-section">
          <h2>3. Clientes (tutores de pets)</h2>
          <p>Área do cliente — <Link to="/cliente/login">/cliente/login</Link></p>
          <div className="teste-buttons">
            <button type="button" onClick={() => testAuthLogin('cliente@teste.com', 'Cliente@2026', 'Cliente')} disabled={loading}>
              Cliente Teste
            </button>
            <button type="button" onClick={() => testAuthLogin('maria@teste.com', 'Maria@2026', 'Maria')} disabled={loading}>
              Maria
            </button>
            <button type="button" onClick={() => testAuthLogin('joao@teste.com', 'Joao@2026', 'João')} disabled={loading}>
              João
            </button>
          </div>
        </section>

        {result && <div className={`teste-result ${result.startsWith('✅') ? 'success' : 'error'}`}>{result}</div>}

        <p className="teste-logins-back">
          <Link to="/">← Voltar para Home</Link>
        </p>
      </div>
    </div>
  );
}