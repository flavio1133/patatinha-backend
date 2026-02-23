import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export default function GestaoLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false); // NOVO ESTADO
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // NOVO useEffect para redirecionamento forçado
  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = '/gestao/dashboard';
    }
  }, [shouldRedirect]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role;
      if (['super_admin', 'master', 'manager', 'employee', 'financial'].includes(userRole)) {
        navigate('/gestao/dashboard');
      } else {
        navigate('/cliente/login');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const currentUser = result.user || user;
      const userRole = currentUser?.role;
      if (['super_admin', 'master', 'manager', 'employee', 'financial'].includes(userRole)) {
        setShouldRedirect(true); // ← ATIVA O REDIRECIONAMENTO FORÇADO
      } else {
        setError('Esta área é apenas para funcionários. Use a área do cliente.');
        setTimeout(() => navigate('/cliente/login'), 2000);
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-link">← Voltar</Link>
          <Link to="/" className="login-brand">
            <h1>🐾 Patatinha</h1>
          </Link>
          <p>Painel de Gestão</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@patatinha.com"
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
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div className="login-footer">
            <p className="login-warning">
              ⚠️ Acesso restrito a funcionários autorizados
            </p>
            <p className="login-hint">
              É dono ou funcionário de pet shop? <Link to="/company/login">Login da empresa</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}