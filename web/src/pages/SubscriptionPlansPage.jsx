import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { subscriptionPlansAPI } from '../services/api';
import './SubscriptionPlansPage.css';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    subscriptionPlansAPI.getAll()
      .then((res) => setPlans(res.data.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = (plan) => {
    const token = localStorage.getItem('company_token');
    if (!token) {
      navigate('/company/login', { state: { from: '/assinatura/checkout', plan } });
      return;
    }
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    navigate('/assinatura/checkout', { state: { plan: selectedPlan } });
  };

  if (loading) {
    return <div className="subscription-plans-page"><div className="loading">Carregando planos...</div></div>;
  }

  return (
    <div className="subscription-plans-page">
      <div className="subscription-plans-container">
        <header className="subscription-plans-header">
          <Link to="/" className="back-link">← Voltar</Link>
          <h1>Escolha seu plano</h1>
          <p>15 dias grátis para testar. Cancele quando quiser.</p>
        </header>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''} ${plan.id === 'plan_1' ? 'highlight' : ''}`}
            >
              {plan.id === 'plan_1' && <span className="plan-badge">Mais popular</span>}
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">
                <span className="price-value">R$ {plan.price?.toFixed(2).replace('.', ',')}</span>
                <span className="price-period">/mês</span>
              </div>
              <div className="plan-features">
                <div className="feature"><span>✓</span> Serviços ilimitados</div>
                <div className="feature"><span>✓</span> Clientes ilimitados</div>
                <div className="feature"><span>✓</span> Até {plan.max_employees || 5} funcionários</div>
                <div className="feature"><span>✓</span> Relatórios</div>
                {plan.has_whatsapp_integration && <div className="feature"><span>✓</span> Integração WhatsApp</div>}
                {plan.has_api_access && <div className="feature"><span>✓</span> Acesso API</div>}
              </div>
              <div className="plan-trial">🎁 15 dias grátis</div>
              <button type="button" className="btn-plan" onClick={() => handleSelectPlan(plan)}>
                Assinar agora
              </button>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmar assinatura</h3>
              <p>Plano: <strong>{selectedPlan.name}</strong></p>
              <p>Valor: <strong>R$ {selectedPlan.price?.toFixed(2).replace('.', ',')}/mês</strong></p>
              <p>Período de teste: 15 dias grátis</p>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedPlan(null)}>Voltar</button>
                <button type="button" className="btn-confirm" onClick={handleConfirm}>Continuar para pagamento</button>
              </div>
            </div>
          </div>
        )}

        <p className="subscription-plans-footer">
          Já tem conta? <Link to="/company/login">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
