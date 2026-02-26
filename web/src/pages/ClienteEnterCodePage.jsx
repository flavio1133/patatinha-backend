import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../contexts/CompanyContext';
import { invitationCodesAPI } from '../services/api';
import './ClienteEnterCodePage.css';

export default function ClienteEnterCodePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { setCompanyId } = useCompany();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Restaurar validated ao voltar do login/cadastro
  useEffect(() => {
    if (location.state?.validated) {
      setValidated(location.state.validated);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state?.validated, location.pathname]);

  // Pré-preencher código vindo da URL (ex: QR Code)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get('code');
    if (codeFromUrl) {
      const clean = codeFromUrl.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      setCode(clean);
    }
  }, [location.search]);

  const handleChange = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setCode(v);
    setError('');
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      setError('Digite um código válido');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await invitationCodesAPI.validate(code);
      setValidated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!validated || !isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      await invitationCodesAPI.linkToCompany(validated.invitation.id);
      const companyId = validated.company.id;
      localStorage.setItem('client_company_id', companyId);
      // Invalidar caches para que cliente e petshop vejam dados atualizados após o vínculo
      queryClient.invalidateQueries({ queryKey: ['linked-companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-public', companyId] });
      setCompanyId(companyId);
      navigate('/cliente/home', { state: { message: `Bem-vindo à ${validated.company.name}!` } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao vincular');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cliente-enter-code-page">
      <div className="cliente-enter-code-container">
        <div className="code-header">
          <span className="code-icon">🐾</span>
          <h1>Bem-vindo ao Pet Shop App</h1>
          <p>Digite o código fornecido pelo seu pet shop</p>
        </div>

        {!validated ? (
          <form onSubmit={handleValidate} className="code-form">
            <label htmlFor="client-access-code" className="code-label">
              Código de acesso
            </label>
            <input
              id="client-access-code"
              name="client-access-code"
              type="text"
              value={code}
              onChange={handleChange}
              placeholder="EX: ABC12345"
              className="code-input"
              maxLength={8}
            />
            {error && <p className="code-error">{error}</p>}
            <button type="submit" className="btn-validate" disabled={loading || code.length < 4}>
              {loading ? 'Validando...' : 'Validar código'}
            </button>
          </form>
        ) : (
          <div className="code-validated">
            <h3>Código válido!</h3>
            <div className="company-preview">
              {validated.company.logo_url ? (
                <img src={validated.company.logo_url} alt="" />
              ) : (
                <span className="company-logo-placeholder">🐾</span>
              )}
              <p className="company-name">{validated.company.name}</p>
            </div>
            {!isAuthenticated ? (
              <p className="auth-required">
                <Link to="/cliente/login" state={{ from: '/cliente/codigo', validated }}>Faça login</Link>
                {' ou '}
                <Link to="/cliente/cadastro" state={{ from: '/cliente/codigo', validated }}>cadastre-se</Link>
                {' para continuar'}
              </p>
            ) : (
              <>
                {error && <p className="code-error">{error}</p>}
                <button type="button" className="btn-confirm" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Vinculando...' : 'Confirmar e continuar'}
                </button>
              </>
            )}
          </div>
        )}

        <p className="code-footer">Não tem código? Entre em contato com seu pet shop</p>
      </div>
    </div>
  );
}
