import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companySubscriptionAPI } from '../services/api';
import './SubscriptionManagementPage.css';

export default function SubscriptionManagementPage() {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      companySubscriptionAPI.getCurrent(),
      companySubscriptionAPI.getHistory(),
    ])
      .then(([res1, res2]) => {
        setSubscription(res1.data);
        setPayments(res2.data.payments || []);
      })
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setActionLoading(true);
    try {
      await companySubscriptionAPI.cancel();
      setSubscription((s) => ({ ...s, subscription_status: 'canceled' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await companySubscriptionAPI.reactivate();
      setSubscription((s) => ({ ...s, subscription_status: 'active' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao reativar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="subscription-mgmt-page"><div className="loading">Carregando...</div></div>;
  }

  const statusLabels = {
    trial: 'Período de teste',
    active: 'Ativo',
    canceled: 'Cancelado',
    past_due: 'Inadimplente',
    pending: 'Pendente',
  };

  return (
    <div className="subscription-mgmt-page">
      <div className="subscription-mgmt-container">
        <h1>Minha assinatura</h1>

        <section className="status-card">
          <h2>Status atual</h2>
          <div className="status-badge" data-status={subscription?.subscription_status || 'trial'}>
            {statusLabels[subscription?.subscription_status] || subscription?.subscription_status}
          </div>
          {subscription?.plan && (
            <>
              <p><strong>Plano:</strong> {subscription.plan.name}</p>
              <p><strong>Valor:</strong> R$ {subscription.plan.price?.toFixed(2).replace('.', ',')}/mês</p>
            </>
          )}
          {subscription?.trial_days_left > 0 && (
            <p className="trial-days">Dias restantes de teste: <strong>{subscription.trial_days_left}</strong></p>
          )}
          {subscription?.next_billing && subscription?.subscription_status === 'active' && (
            <p>Próxima cobrança: {new Date(subscription.next_billing).toLocaleDateString('pt-BR')}</p>
          )}
        </section>

        <section className="actions-section">
          {subscription?.subscription_status === 'canceled' ? (
            <button type="button" className="btn btn-reactivate" onClick={handleReactivate} disabled={actionLoading}>
              Reativar assinatura
            </button>
          ) : subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trial' ? (
            <button type="button" className="btn btn-cancel" onClick={handleCancel} disabled={actionLoading}>
              Cancelar assinatura
            </button>
          ) : null}
          {(subscription?.subscription_status === 'trial' || subscription?.subscription_status === 'expired') && (
            <Link to="/assinatura" className="btn btn-primary">Escolher plano</Link>
          )}
        </section>

        <section className="history-section">
          <h2>Histórico de pagamentos</h2>
          {payments.length === 0 ? (
            <p className="empty">Nenhum pagamento registrado ainda.</p>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.paid_at || p.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>R$ {parseFloat(p.amount).toFixed(2).replace('.', ',')}</td>
                    <td><span className={`status-${p.status}`}>{p.status}</span></td>
                    <td>{p.payment_method || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <p className="back-link">
          <Link to="/company/dashboard">← Voltar ao painel</Link>
        </p>
      </div>
    </div>
  );
}
