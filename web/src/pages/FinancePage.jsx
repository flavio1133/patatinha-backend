import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeAPI } from '../services/api';
import { mockFinanceDashboard, mockFinanceForecast } from '../data/mockData';
import './FinancePage.css';

export default function FinancePage() {
  const [tab, setTab] = useState('fluxo');
  const today = new Date().toISOString().split('T')[0];

  const { data: apiDashboard } = useQuery({
    queryKey: ['daily-dashboard', today],
    queryFn: () => financeAPI.getDailyDashboard(today).then((res) => res.data),
    retry: false,
  });

  const { data: forecast } = useQuery({
    queryKey: ['cashflow-forecast'],
    queryFn: () => financeAPI.getForecast(30).then((res) => res.data),
    retry: false,
  });

  const dashboard = apiDashboard || mockFinanceDashboard;
  const warnings = forecast?.warnings || mockFinanceForecast.warnings || [];

  const tabs = [
    { id: 'fluxo', label: 'Fluxo de caixa', icon: '📊' },
    { id: 'pagar', label: 'Contas a pagar', icon: '📄' },
    { id: 'receber', label: 'Contas a receber', icon: '💰' },
    { id: 'comissoes', label: 'Comissões', icon: '👤' },
    { id: 'assinaturas', label: 'Assinaturas', icon: '💳' },
  ];

  return (
    <div className="finance-page">
      <div className="finance-summary">
        <div className="summary-card income">
          <h3>Receitas mês</h3>
          <div className="amount">R$ {Number(dashboard?.income ?? 0).toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
          <h3>Despesas mês</h3>
          <div className="amount">R$ {Number(dashboard?.expense ?? 0).toFixed(2)}</div>
        </div>
        <div className="summary-card balance">
          <h3>Saldo</h3>
          <div className="amount">R$ {Number(dashboard?.balance ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="finance-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="finance-content">
        {tab === 'fluxo' && (
          <section>
            <h3>Extrato / Fluxo de caixa</h3>
            <p>Entradas e saídas diárias. Previsão para 30 dias.</p>
          </section>
        )}
        {tab === 'comissoes' && (
          <section>
            <h3>Comissões</h3>
            <p>Lista de funcionários, cálculo por período, pagar comissão.</p>
          </section>
        )}
        {tab === 'assinaturas' && (
          <section>
            <h3>Assinaturas</h3>
            <p>Empresas assinantes, status, próxima cobrança.</p>
          </section>
        )}
        {(tab === 'pagar' || tab === 'receber') && (
          <section>
            <h3>{tab === 'pagar' ? 'Contas a pagar' : 'Contas a receber'}</h3>
            <p>Lista de contas.</p>
          </section>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="forecast-warnings">
          <h3>⚠️ Alertas</h3>
          <p>{warnings.length} dia(s) com saldo negativo projetado</p>
        </div>
      )}
    </div>
  );
}
