import { Link } from 'react-router-dom';
import './PaymentSuccessPage.css';

export default function PaymentSuccessPage() {
  return (
    <div className="payment-success-page">
      <div className="payment-success-container">
        <div className="success-icon">✓</div>
        <h1>Assinatura confirmada!</h1>
        <p className="success-message">
          Agora você tem <strong>15 dias de teste grátis</strong>. Aproveite todos os recursos!
        </p>
        <p className="trial-info">Após o período de teste, a cobrança será feita automaticamente.</p>
        <div className="success-actions">
          <Link to="/company/dashboard" className="btn-primary">Ir para o painel</Link>
          <Link to="/company/dashboard" className="btn-secondary">Convidar equipe</Link>
        </div>
      </div>
    </div>
  );
}
