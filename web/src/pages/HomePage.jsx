import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import './HomePage.css';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado (com role válido)
  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      const userRole = user.role;
      if (userRole === 'customer' || userRole === 'client') {
        navigate('/cliente/home');
      } else if (['super_admin', 'master', 'manager', 'employee', 'financial'].includes(userRole)) {
        navigate('/gestao/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Tela branca apenas se tiver user válido com role (redirecionando)
  if (isAuthenticated && user?.role) {
    return (
      <div className="home-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-background"></div>
      <div className="home-container">
        <div className="home-header">
          <div className="logo-large">🐾</div>
          <h1>Patatinha</h1>
          <p className="slogan">Mimos e cuidados com carinho para o seu pet em Recife</p>
        </div>
        
        <div className="home-content">
          <p className="home-subtitle">
            Escolha como você quer entrar: como tutor que ama seu pet ou como gestor da pet shop.
          </p>

          <div className="access-cards">
            {/* Card Cliente */}
            <div className="access-card card-cliente">
              <div className="card-icon">❤️</div>
              <h2>Quero cuidar do meu pet!</h2>
              <p className="card-description">
                Agende banho, tosa, hotel, compre ração e muito mais!
              </p>
              <Link to="/cliente/login" className="btn-card btn-cliente">
                Entrar como tutor
              </Link>
              <p className="card-hint">
                Ainda não tem conta? <Link to="/cliente/cadastro">Cadastre-se aqui</Link>
              </p>
            </div>

            {/* Card Gestão */}
            <div className="access-card card-gestao">
              <div className="card-icon">🔑</div>
              <h2>Sou da pet shop</h2>
              <p className="card-description">
                Acesse agenda, estoque, finanças e equipe
              </p>
              <Link to="/company/login" className="btn-card btn-gestao">
                Login da empresa
              </Link>
              <p className="card-hint" style={{ marginTop: '12px' }}>
                Primeira vez? <Link to="/cadastro-empresa">Cadastre sua empresa</Link>
              </p>
              <p className="card-hint">
                <Link to="/assinatura">Ver planos e assinaturas</Link>
              </p>
            </div>
          </div>
        </div>

        <footer className="home-footer">
          <p className="footer-hint">
            <Link to="/gestao/login">Acesso administrativo</Link>
          </p>
          <p className="footer-text">
            Patatinha – Sistema feito com carinho para pet shops de Recife
          </p>
          <div className="footer-links">
            <a href="#contato">Contato</a>
            <span>•</span>
            <a href="#privacidade">Política de Privacidade</a>
            <span>•</span>
            <a href="#termos">Termos de Uso</a>
          </div>
          <p className="footer-warning">
            Acesso à área de gestão é restrito a funcionários autorizados. 
            Dúvidas? Fale com a gente no WhatsApp!
          </p>
          <Link to="/gestao/login" className="footer-admin-icon" title="Acesso administrativo">
            ⚙️
          </Link>
        </footer>
      </div>
    </div>
  );
}
