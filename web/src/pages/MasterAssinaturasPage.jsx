import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { masterAPI, subscriptionPlansAPI } from '../services/api';
import './AdminPetsPage.css';

const STATUS_LABEL = {
  active: 'Ativa',
  trial: 'Teste',
  canceled: 'Cancelada',
  past_due: 'Inadimplente',
  blocked: 'Bloqueada',
};

export default function MasterAssinaturasPage() {
  const [addingDays, setAddingDays] = useState(null);
  const [days, setDays] = useState(7);
  const [renewingId, setRenewingId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-companies'],
    queryFn: () => masterAPI.getCompanies().then((res) => res.data),
    retry: 1,
  });

  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans-all'],
    queryFn: () => subscriptionPlansAPI.getAll(false).then((res) => res.data),
    retry: 1,
  });

  const plans = plansData?.plans || [];

  const companies = data?.companies || [];

  const handleAddTrialDays = async (companyId) => {
    setAddingDays(companyId);
    try {
      await masterAPI.updateCompany(companyId, { trial_days_add: days });
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao adicionar dias.');
    } finally {
      setAddingDays(null);
    }
  };

  const handleSetStatus = async (companyId, status) => {
    if (!['active', 'trial', 'blocked', 'canceled'].includes(status)) return;
    try {
      await masterAPI.updateCompany(companyId, { subscription_status: status });
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar status.');
    }
  };

  const renewMutation = useMutation({
    mutationFn: ({ companyId, planId }) =>
      masterAPI.manualPayment(companyId, { plan_id: planId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-companies']);
    },
  });

  const handleRenew = async (companyId, currentPlanId) => {
    const planId = selectedPlan || currentPlanId || plans[0]?.id;
    if (!planId) {
      alert('Nenhum plano disponível para renovar.');
      return;
    }
    setRenewingId(companyId);
    try {
      await renewMutation.mutateAsync({ companyId, planId });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao registrar pagamento.');
    } finally {
      setRenewingId(null);
    }
  };

  if (isLoading && !data) {
    return <div className="admin-pets-loading">Carregando assinaturas...</div>;
  }

  return (
    <div className="admin-pets-page">
      <div className="admin-pets-header">
        <div>
          <h1>Assinaturas e Financeiro</h1>
          <p className="admin-pets-sub">Planos, pagamentos e status por loja.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Dias de teste (avulso):</label>
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 7)}
            style={{ width: '60px' }}
          />
        </div>
      </div>

      {isError && !data && (
        <div className="dashboard-api-error">
          <p>Não foi possível carregar as assinaturas.</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      )}

      <div className="admin-pets-table-wrapper">
        <table className="admin-pets-table">
          <thead>
            <tr>
              <th>Loja</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Teste até</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-pets-empty">Nenhuma loja.</td>
              </tr>
            )}
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>
                  <span className={`status-badge status-${c.subscription_status || 'trial'}`}>
                    {STATUS_LABEL[c.subscription_status] || c.subscription_status || 'Teste'}
                  </span>
                </td>
                <td>{c.trial_end ? new Date(c.trial_end).toLocaleDateString('pt-BR') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-admin-view"
                      onClick={() => handleAddTrialDays(c.id)}
                      disabled={addingDays != null}
                    >
                      {addingDays === c.id ? '...' : `+${days} dias teste`}
                    </button>
                    <button
                      type="button"
                      className="btn-admin-view"
                      onClick={() => handleSetStatus(c.id, 'active')}
                    >
                      Ativar
                    </button>
                    <button
                      type="button"
                      className="btn-admin-view btn-admin-danger"
                      onClick={() => handleSetStatus(c.id, 'blocked')}
                    >
                      Suspender acesso
                    </button>
                    <button
                      type="button"
                      className="btn-admin-view"
                      onClick={() => handleRenew(c.id, c.subscription_plan_id)}
                      disabled={renewingId != null}
                    >
                      {renewingId === c.id ? 'Registrando...' : 'Registrar pagamento / Renovar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
