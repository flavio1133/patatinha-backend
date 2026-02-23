import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI, invitationCodesAPI } from '../services/api';
import './LoginPage.css';

export default function ClienteCadastroPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteValidated, setInviteValidated] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const fromCode = location.state?.from === '/cliente/codigo';
  const validatedInvitation = location.state?.validated;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInviteChange = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setInviteCode(v);
    setInviteError('');
  };

  const handleValidateInvite = async () => {
    if (!inviteCode || inviteCode.length < 4) {
      setInviteError('Digite um código válido');
      return;
    }
    setInviteLoading(true);
    setInviteError('');
    try {
      const res = await invitationCodesAPI.validate(inviteCode);
      setInviteValidated(res.data);
    } catch (err) {
      setInviteValidated(null);
      setInviteError(err.response?.data?.error || 'Código inválido');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Se usuário digitou código mas não validou
    if (inviteCode && !inviteValidated) {
      setError('Valide o código de vinculação antes de continuar.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      // Login automático após cadastro
      localStorage.setItem('auth_token', response.data.token);
      await refreshUser();

       // Se houver código validado aqui, já vincular direto
      if (inviteValidated) {
        try {
          await invitationCodesAPI.linkToCompany(inviteValidated.invitation.id);
          localStorage.setItem('client_company_id', inviteValidated.company.id);
        } catch (linkErr) {
          console.error('Erro ao vincular cliente à empresa:', linkErr);
        }
      }

      // Se veio da tela de código, voltar para confirmar vínculo
      if (fromCode && validatedInvitation) {
        navigate('/cliente/codigo', { state: { validated: validatedInvitation } });
      } else {
        navigate('/cliente/home');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(error.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <Link to="/" className="back-link">← Voltar</Link>
          <Link to="/" className="login-brand">
            <h1>🐾 Patatinha</h1>
          </Link>
          <p>Criar Conta de Cliente</p>
        </div>
          <div className="form-group">
            <label>Código do seu pet shop (opcional)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inviteCode}
                onChange={handleInviteChange}
                placeholder="EX: ABC12345"
                maxLength={8}
              />
              <button
                type="button"
                className="secondary-btn"
                onClick={handleValidateInvite}
                disabled={inviteLoading}
              >
                {inviteLoading ? 'Validando...' : 'Validar'}
              </button>
            </div>
            {inviteValidated && (
              <p className="success-message">
                Código válido para <strong>{inviteValidated.company.name}</strong>
              </p>
            )}
            {inviteError && <p className="error-message">{inviteError}</p>}
          </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Seu nome"
            />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(81) 99999-9999"
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="form-group">
            <label>Confirmar Senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Digite a senha novamente"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
          <div className="login-footer">
            <p>
              Já tem conta?{' '}
              <Link to="/cliente/login" state={location.state}>Faça login aqui</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
