import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { companiesAPI } from '../services/api';
import './LoginPage.css';

export default function EmpresaLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await companiesAPI.login(email, password);
      const { token, company, role } = res.data;

      if (!token || !company) {
        setError('Resposta inválida do servidor. Tente novamente.');
        return;
      }

      // Login da empresa usa company_token (não auth_token)
      localStorage.setItem('company_token', token);
      localStorage.setItem('company_id', company.id);
      localStorage.setItem('company_role', role || 'owner');

      const from = location.state?.from;
      const plan = location.state?.plan;

      if (from === '/assinatura/checkout' && plan) {
        window.location.href = `/assinatura/checkout?plan=${plan}`;
      } else {
        window.location.href = '/company/dashboard';
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message;
      if (status === 404) {
        setError('Serviço temporariamente indisponível. A API ainda não está configurada para produção.');
      } else {
        setError(msg || 'E-mail ou senha inválidos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page empresa-login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-link">← Voltar</Link>
          <Link to="/" className="login-brand">
            <h1>🐾 Patatinha</h1>
          </Link>
          <p>Login da Empresa</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="contato@petshop.com"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Primeira vez? <Link to="/cadastro-empresa">Cadastre sua empresa</Link>
          </p>
          <p className="login-hint">
            É administrador da plataforma? <Link to="/gestao/login">Acesso administrativo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}