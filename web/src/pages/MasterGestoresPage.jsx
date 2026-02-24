import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { masterAPI } from '../services/api';
import './DashboardPage.css';
import './AdminPetsPage.css';

export default function MasterGestoresPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [tempPassword, setTempPassword] = useState('');

  const { data: companiesData } = useQuery({
    queryKey: ['master-companies'],
    queryFn: () => masterAPI.getCompanies().then((res) => res.data),
  });

  const { data: companyDetail, refetch } = useQuery({
    queryKey: ['master-company-owner', selectedCompanyId],
    queryFn: () => masterAPI.getCompany(selectedCompanyId).then((res) => res.data),
    enabled: !!selectedCompanyId,
    onSuccess: (company) => {
      setEditForm({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
      });
      setTempPassword('');
    },
  });

  const updateOwnerMutation = useMutation({
    mutationFn: ({ companyId, payload }) => masterAPI.updateOwner(companyId, payload),
    onSuccess: () => {
      refetch();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ companyId, payload }) => masterAPI.resetOwnerPassword(companyId, payload),
    onSuccess: (res) => {
      setTempPassword(res.data.temporary_password);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ companyId, payload }) => masterAPI.updateOwnerStatus(companyId, payload),
    onSuccess: () => {
      refetch();
    },
  });

  const companies = companiesData?.companies || [];
  const company = companyDetail || null;

  const handleSave = () => {
    if (!selectedCompanyId || !company) return;
    const wantsEmailChange = editForm.email && editForm.email !== company.email;
    const confirmName =
      wantsEmailChange || editForm.name !== company.name
        ? window.prompt(`Para confirmar, digite exatamente o nome da empresa: "${company.name}"`)
        : undefined;
    if ((wantsEmailChange || editForm.name !== company.name) && !confirmName) return;

    updateOwnerMutation.mutate({
      companyId: selectedCompanyId,
      payload: {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        confirm_name: confirmName,
      },
    });
  };

  const handleResetPassword = () => {
    if (!selectedCompanyId || !company) return;
    const confirmName = window.prompt(
      `Redefinir a senha do gestor da empresa "${company.name}".\nDigite o nome da empresa para confirmar:`
    );
    if (!confirmName) return;
    resetPasswordMutation.mutate({
      companyId: selectedCompanyId,
      payload: { confirm_name: confirmName },
    });
  };

  const handleToggleStatus = () => {
    if (!selectedCompanyId || !company) return;
    const currentlyActive = company.owner_is_active !== false;
    const confirmName = window.prompt(
      `${currentlyActive ? 'Inativar' : 'Reativar'} o gestor da empresa "${company.name}".\nDigite o nome da empresa para confirmar:`
    );
    if (!confirmName) return;
    const reason = window.prompt('Motivo (opcional):') || undefined;
    updateStatusMutation.mutate({
      companyId: selectedCompanyId,
      payload: {
        is_active: !currentlyActive,
        confirm_name: confirmName,
        reason,
      },
    });
  };

  return (
    <div className="dashboard">
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Gestores da Conta</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
          Controle absoluto de identidade dos donos/gestores das empresas clientes.
        </p>

        <div className="stat-card" style={{ marginBottom: 24 }}>
          <div className="stat-icon">🏪</div>
          <div className="stat-content" style={{ width: '100%' }}>
            <div className="stat-label">Selecione uma empresa</div>
            <div style={{ marginTop: 12 }}>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{ minWidth: 260 }}
              >
                <option value="">Escolha uma empresa...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city || 'Cidade não informada'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {company && (
          <div className="dashboard-grid">
            <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-icon">👤</div>
              <div className="stat-content" style={{ width: '100%' }}>
                <div className="stat-label">Gestor da Conta (Proprietário)</div>
                <div className="stat-extra" style={{ marginBottom: 12 }}>
                  Edição suprema de dados cadastrais e credenciais do dono da empresa.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label>Nome</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>E-mail</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>Telefone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label>Status</label>
                    <div style={{ marginTop: 8 }}>
                      <span
                        className={`status-badge ${company.owner_is_active === false ? 'expired' : 'available'}`}
                      >
                        {company.owner_is_active === false ? 'Suspenso' : 'Ativo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                  <button
                    type="button"
                    className="btn-admin-view"
                    onClick={handleSave}
                    disabled={updateOwnerMutation.isLoading}
                  >
                    {updateOwnerMutation.isLoading ? 'Salvando...' : 'Salvar dados do Gestor'}
                  </button>
                  <button
                    type="button"
                    className="btn-admin-view"
                    onClick={handleResetPassword}
                    disabled={resetPasswordMutation.isLoading}
                    style={{ backgroundColor: '#1e40af' }}
                  >
                    {resetPasswordMutation.isLoading ? 'Gerando...' : 'Redefinir credenciais'}
                  </button>
                  <button
                    type="button"
                    className="btn-admin-view btn-admin-danger"
                    onClick={handleToggleStatus}
                    disabled={updateStatusMutation.isLoading}
                  >
                    {company.owner_is_active === false ? 'Reativar Gestor' : 'Inativar Gestor'}
                  </button>
                </div>

                {tempPassword && (
                  <p style={{ marginTop: 12, fontSize: 13, color: '#fbbf24' }}>
                    Senha temporária gerada:{' '}
                    <code style={{ background: '#111827', padding: '2px 6px', borderRadius: 6 }}>
                      {tempPassword}
                    </code>
                    . Entregue com segurança ao cliente.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

