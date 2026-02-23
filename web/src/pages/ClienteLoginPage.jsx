import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export default function ClienteLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCode = location.state?.from === '/cliente/codigo';
  const validatedInvitation = location.state?.validated;

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role;
      if (userRole === 'customer' || userRole === 'client') {
        // Se veio da tela de código com convite validado, voltar para confirmar
        if (fromCode && validatedInvitation) {
          navigate('/cliente/codigo', { state: { validated: validatedInvitation } });
        } else {
          navigate('/cliente/home');
        }
      } else {
        navigate('/gestao/login');
      }
    }
  }, [isAuthenticated, user, navigate, fromCode, validatedInvitation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const currentUser = result.user || user;
      const userRole = currentUser?.role;
      if (userRole === 'customer' || userRole === 'client') {
        if (fromCode && validatedInvitation) {
          navigate('/cliente/codigo', { state: { validated: validatedInvitation } });
        } else {
          navigate('/cliente/home');
        }
      } else {
        setError('Esta área é apenas para clientes. Use a área de gestão.');
        setTimeout(() => navigate('/gestao/login'), 2000);
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
          <p>Área do Cliente</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
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
            <p>
              Ainda não tem conta?{' '}
              <Link to="/cliente/cadastro" state={location.state}>Cadastre-se aqui</Link>
            </p>
            <p>
              <Link to="/esqueci-senha">Esqueceu a senha?</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
