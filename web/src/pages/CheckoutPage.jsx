import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { companySubscriptionAPI } from '../services/api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!plan) {
      navigate('/assinatura');
      return;
    }
    const token = localStorage.getItem('company_token');
    if (!token) {
      navigate('/company/login', { state: { from: '/assinatura/checkout', plan } });
    }
  }, [plan, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await companySubscriptionAPI.checkout(plan.id, paymentMethod);
      navigate('/assinatura/sucesso', { state: { payment: res.data.payment, plan } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <Link to="/assinatura" className="back-link">← Voltar</Link>
          <h1>Finalizar assinatura</h1>
        </header>

        <div className="checkout-content">
          <section className="order-summary">
            <h3>Resumo do pedido</h3>
            <div className="summary-row">
              <span>Plano</span>
              <strong>{plan.name}</strong>
            </div>
            <div className="summary-row">
              <span>Valor</span>
              <strong>R$ {plan.price?.toFixed(2).replace('.', ',')}/mês</strong>
            </div>
            <div className="summary-row highlight">
              <span>Período de teste</span>
              <strong>15 dias grátis</strong>
            </div>
            <div className="summary-row">
              <span>Primeira cobrança</span>
              <span>Após 15 dias</span>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Forma de pagamento</h3>
            <div className="payment-tabs">
              <label className={`tab ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                <input type="radio" name="method" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} />
                Cartão
              </label>
              <label className={`tab ${paymentMethod === 'pix' ? 'active' : ''}`}>
                <input type="radio" name="method" value="pix" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                PIX
              </label>
              <label className={`tab ${paymentMethod === 'boleto' ? 'active' : ''}`}>
                <input type="radio" name="method" value="boleto" checked={paymentMethod === 'boleto'} onChange={() => setPaymentMethod('boleto')} />
                Boleto
              </label>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="card-form">
                <p className="mock-notice">Em desenvolvimento: integração com Mercado Pago. Clique em "Finalizar" para simular pagamento aprovado.</p>
                <div className="form-group">
                  <label>Nome no cartão</label>
                  <input type="text" placeholder="Como está no cartão" disabled />
                </div>
                <div className="form-group">
                  <label>Número do cartão</label>
                  <input type="text" placeholder="0000 0000 0000 0000" disabled />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Validade</label>
                    <input type="text" placeholder="MM/AA" disabled />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" placeholder="123" disabled />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <p className="mock-notice">PIX: QR Code será exibido após confirmação. (Em desenvolvimento)</p>
            )}

            {paymentMethod === 'boleto' && (
              <p className="mock-notice">Boleto: link para download será enviado por e-mail. (Em desenvolvimento)</p>
            )}

            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Processando...' : 'Finalizar assinatura'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
