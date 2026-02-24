import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterAPI } from '../services/api';
import './DashboardPage.css';
import './AdminPetsPage.css';

const DEFAULT_MODULES = {
  pdv: true,
  finance: true,
  inventory: true,
  reports: true,
};

export default function MasterFeatureTogglePage() {
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [localModules, setLocalModules] = useState(DEFAULT_MODULES);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-companies'],
    queryFn: () => masterAPI.getCompanies().then((res) => res.data),
    retry: 1,
  });

  const { data: companyDetail } = useQuery({
    queryKey: ['master-company-modules', selectedCompanyId],
    queryFn: () => masterAPI.getCompany(selectedCompanyId).then((res) => res.data),
    enabled: !!selectedCompanyId,
    onSuccess: (company) => {
      const enabled = company?.settings?.enabled_modules || {};
      setLocalModules({
        pdv: enabled.pdv !== false,
        finance: enabled.finance !== false,
        inventory: enabled.inventory !== false,
        reports: enabled.reports !== false,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ companyId, modules }) =>
      masterAPI.updateCompanyModules(companyId, modules),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-company-modules', selectedCompanyId]);
    },
  });

  const companies = data?.companies || [];

  const handleToggle = (key) => {
    setLocalModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    if (!selectedCompanyId) return;
    updateMutation.mutate(
      { companyId: selectedCompanyId, modules: localModules },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao salvar módulos.');
        },
      }
    );
  };

  const applyBasicPlan = () => {
    setLocalModules({
      pdv: true,
      finance: false,
      inventory: true,
      reports: false,
    });
  };

  const applyPremiumPlan = () => {
    setLocalModules({
      pdv: true,
      finance: true,
      inventory: true,
      reports: true,
    });
  };

  return (
    <div className="dashboard">
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Módulos e Feature Toggle</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
          Ative ou desative módulos por loja. Use os presets de plano para aplicar combinações rapidamente.
        </p>

        <div className="stat-card" style={{ marginBottom: 24 }}>
          <div className="stat-icon">🏪</div>
          <div className="stat-content" style={{ width: '100%' }}>
            <div className="stat-label">Selecione uma loja</div>
            <div style={{ marginTop: 12 }}>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{ minWidth: 260 }}
              >
                <option value="">Escolha uma loja...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city || 'Cidade não informada'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isError && !data && (
          <div className="dashboard-api-error">
            <p>Não foi possível carregar a lista de lojas.</p>
            <button type="button" className="btn-retry" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {selectedCompanyId && (
          <div className="dashboard-grid">
            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-icon">🔧</div>
              <div className="stat-content" style={{ width: '100%' }}>
                <div className="stat-label">Módulos e Permissões do Plano</div>
                <div className="stat-extra" style={{ marginBottom: 16 }}>
                  Defina quais módulos o tenant pode ver e acessar no painel de gestão.
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-admin-view" onClick={applyBasicPlan}>
                    Aplicar plano Básico
                  </button>
                  <button type="button" className="btn-admin-view" onClick={applyPremiumPlan}>
                    Aplicar plano Premium
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                  }}
                >
                  <ToggleRow
                    label="PDV"
                    description="Ponto de venda e caixa da loja."
                    checked={localModules.pdv}
                    onChange={() => handleToggle('pdv')}
                  />
                  <ToggleRow
                    label="Financeiro"
                    description="Visão de fluxo de caixa e lançamentos."
                    checked={localModules.finance}
                    onChange={() => handleToggle('finance')}
                  />
                  <ToggleRow
                    label="Estoque"
                    description="Cadastro e controle de produtos."
                    checked={localModules.inventory}
                    onChange={() => handleToggle('inventory')}
                  />
                  <ToggleRow
                    label="Relatórios avançados"
                    description="Dashboards e relatórios detalhados."
                    checked={localModules.reports}
                    onChange={() => handleToggle('reports')}
                  />
                </div>

                <button
                  type="button"
                  className="btn-retry"
                  style={{ marginTop: 20 }}
                  onClick={handleApply}
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? 'Salvando...' : 'Salvar módulos da loja'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'rgba(17, 24, 39, 0.9)',
        border: '1px solid rgba(55, 65, 81, 0.8)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>{description}</div>
      </div>
      <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={onChange}
          style={{ display: 'none' }}
        />
        <span
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            background: checked ? '#16a34a' : 'rgba(55, 65, 81, 0.9)',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 22 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#111827',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              transition: 'left 0.2s',
            }}
          />
        </span>
      </label>
    </div>
  );
}
