import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterAPI } from '../services/api';
import './DashboardPage.css';

const ROLE_LABEL = {
  master: 'Administrador',
  manager: 'Gestor',
  employee: 'Analista',
  financial: 'Financeiro',
  super_admin: 'Super Admin',
};

export default function MasterEquipePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingId, setEditingId] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-staff'],
    queryFn: () => masterAPI.getStaff().then((res) => res.data),
    retry: 1,
  });

  const staff = data?.staff || [];

  const createMutation = useMutation({
    mutationFn: (payload) => masterAPI.createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-staff']);
      setForm({ name: '', email: '', password: '', role: 'employee' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => masterAPI.updateStaff(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-staff']);
      setEditingId(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => masterAPI.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-staff']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    createMutation.mutate(form, {
      onError: (err) => {
        alert(err.response?.data?.error || 'Erro ao criar membro da equipe.');
      },
    });
  };

  const toggleActive = (member) => {
    updateMutation.mutate(
      { id: member.id, data: { isActive: !member.isActive } },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao atualizar usuário.');
        },
      }
    );
  };

  if (isLoading && !data) {
    return <div className="loading">Carregando equipe...</div>;
  }

  return (
    <div className="dashboard">
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Equipe Master (SaaS Staff)</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
          Cadastre funcionários da sua empresa de software (suporte, vendas, financeiro) e controle quem pode acessar as lojas e atender chamados.
        </p>

        <form onSubmit={handleSubmit} className="dashboard-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card" style={{ maxWidth: 520 }}>
            <div className="stat-icon">➕</div>
            <div className="stat-content">
              <div className="stat-label">Novo membro da Equipe Master</div>
              <div className="stat-extra">Preencha os dados para criar um acesso interno.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Senha inicial"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="employee">Analista de Suporte</option>
                  <option value="manager">Gestor de Operações</option>
                  <option value="financial">Financeiro</option>
                  <option value="master">Admin interno</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-retry"
                style={{ marginTop: 16, alignSelf: 'flex-start' }}
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? 'Salvando...' : 'Adicionar à Equipe Master'}
              </button>
            </div>
          </div>
        </form>

        {isError && !data && (
          <div className="dashboard-api-error">
            <p>Não foi possível carregar a equipe.</p>
            <button type="button" className="btn-retry" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-content" style={{ width: '100%' }}>
              <div className="stat-label">Membros cadastrados</div>
              <div className="stat-extra">Apenas usuários internos (não inclui clientes da plataforma).</div>
              <div style={{ marginTop: 16, overflowX: 'auto' }}>
                <table className="admin-pets-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Papel</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#a0a0a0' }}>
                          Nenhum membro cadastrado ainda.
                        </td>
                      </tr>
                    )}
                    {staff.map((m) => (
                      <tr key={m.id}>
                        <td>{m.name || '—'}</td>
                        <td>{m.email || '—'}</td>
                        <td>{ROLE_LABEL[m.role] || m.role}</td>
                        <td>
                          <span
                            className={`status-badge ${m.isActive ? 'available' : 'expired'}`}
                            style={{ fontSize: '0.8rem' }}
                          >
                            {m.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-admin-view"
                            onClick={() => toggleActive(m)}
                            disabled={updateMutation.isLoading}
                          >
                            {m.isActive ? 'Desativar' : 'Reativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
