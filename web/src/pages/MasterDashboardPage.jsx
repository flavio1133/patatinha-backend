import { useQuery } from '@tanstack/react-query';
import { masterAPI } from '../services/api';
import './DashboardPage.css';

export default function MasterDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-dashboard'],
    queryFn: () => masterAPI.getDashboard().then((res) => res.data),
    retry: 1,
  });

  if (isLoading && !data) return <div className="loading">Carregando métricas...</div>;

  const m = data || { totalStores: 0, activeStores: 0, newStoresThisMonth: 0, delinquentStores: 0, mrr: 0, inactiveStores: 0 };

  return (
    <div className="dashboard">
      {isError && !data && (
        <div className="dashboard-api-error">
          <p>Não foi possível carregar as métricas.</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      )}
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Métricas da plataforma</h2>
        <div className="dashboard-grid">
          <div className="stat-card"><div className="stat-icon">🏪</div><div className="stat-content"><div className="stat-value">{m.totalStores}</div><div className="stat-label">Total de lojas</div></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-content"><div className="stat-value">{m.activeStores}</div><div className="stat-label">Lojas ativas</div></div></div>
          <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-content"><div className="stat-value">R$ {Number(m.mrr || 0).toFixed(2)}</div><div className="stat-label">MRR</div></div></div>
          <div className="stat-card"><div className="stat-icon">🆕</div><div className="stat-content"><div className="stat-value">{m.newStoresThisMonth}</div><div className="stat-label">Novas (mês)</div></div></div>
          <div className="stat-card stat-card-warn"><div className="stat-icon">⚠️</div><div className="stat-content"><div className="stat-value">{m.delinquentStores}</div><div className="stat-label">Inadimplentes</div></div></div>
          <div className="stat-card"><div className="stat-icon">⏸️</div><div className="stat-content"><div className="stat-value">{m.inactiveStores}</div><div className="stat-label">Inativas</div></div></div>
        </div>
      </section>
    </div>
  );
}
