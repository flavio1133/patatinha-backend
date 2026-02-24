import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalsAPI } from '../services/api';
import './ProfissionaisSection.css';

/* Cargos do pet shop – um profissional pode ter mais de um */
const CARGOS_OPERACIONAL = [
  { id: 'tosador', label: 'Tosador', desc: 'Cortes de raças e estética' },
  { id: 'banhista', label: 'Banhista', desc: 'Higiene, secagem e escovação' },
  { id: 'veterinario', label: 'Médico Veterinário', desc: 'Consultas, vacinas e responsabilidade técnica' },
  { id: 'auxiliar', label: 'Auxiliar de Pet Shop', desc: 'Contenção dos animais e organização' },
];

const CARGOS_ATENDIMENTO = [
  { id: 'recepcionista', label: 'Recepcionista', desc: 'Agenda, check-in e pagamentos' },
  { id: 'vendedor', label: 'Vendedor', desc: 'Atendimento no balcão e consultoria de produtos' },
  { id: 'gerente', label: 'Gerente', desc: 'Supervisão da equipe, estoque e financeiro' },
];

const CARGOS_ALL = [...CARGOS_OPERACIONAL, ...CARGOS_ATENDIMENTO];
const CARGO_LABEL = Object.fromEntries(CARGOS_ALL.map((c) => [c.id, c.label]));

const emptyStaffForm = () => ({
  name: '',
  email: '',
  phone: '',
  specialties: '',
  roles: [],
  isActive: true,
  canViewAgenda: true,
  canEditAgenda: true,
  canEditInventory: false,
  canViewFinance: false,
});

export default function ProfissionaisSection() {
  const queryClient = useQueryClient();
  const { data: professionalsRes } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsAPI.getAll().then((r) => r.data),
  });
  const professionals = professionalsRes?.professionals || [];

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [staffCredentials, setStaffCredentials] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');

  const staffMutation = useMutation({
    mutationFn: (payload) => {
      if (editingStaff) return professionalsAPI.update(editingStaff.id, payload);
      return professionalsAPI.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setStaffModalOpen(false);
      setEditingStaff(null);
      setStaffForm(emptyStaffForm());
    },
  });

  const createLoginMutation = useMutation({
    mutationFn: (id) => professionalsAPI.createLogin(id),
    onSuccess: (res) => {
      setStaffCredentials(res.data?.credentials || null);
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, reason }) => professionalsAPI.deactivate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setDeactivateTarget(null);
      setDeactivateReason('');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Apenas Gestor ou Super Admin pode desativar. Informe o motivo.');
    },
  });

  const openNewStaff = () => {
    setEditingStaff(null);
    setStaffCredentials(null);
    setStaffForm(emptyStaffForm());
    setStaffModalOpen(true);
  };

  const openEditStaff = (p) => {
    setEditingStaff(p);
    setStaffCredentials(null);
    setStaffForm({
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      specialties: (p.specialties || []).join(', '),
      roles: Array.isArray(p.roles) ? [...p.roles] : [],
      isActive: p.isActive !== false,
      canViewAgenda: p.permissions?.canViewAgenda ?? true,
      canEditAgenda: p.permissions?.canEditAgenda ?? true,
      canEditInventory: p.permissions?.canEditInventory ?? false,
      canViewFinance: p.permissions?.canViewFinance ?? false,
    });
    setStaffModalOpen(true);
  };

  const toggleRole = (id) => {
    setStaffForm((f) => ({
      ...f,
      roles: f.roles.includes(id) ? f.roles.filter((r) => r !== id) : [...f.roles, id],
    }));
  };

  const handleSubmitStaff = (e) => {
    e.preventDefault();
    if (!staffForm.name.trim()) return;
    const specialtiesArray = staffForm.specialties
      ? staffForm.specialties.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const payload = {
      name: staffForm.name.trim(),
      email: staffForm.email.trim() || undefined,
      phone: staffForm.phone.trim() || undefined,
      specialties: specialtiesArray,
      roles: staffForm.roles,
      isActive: !!staffForm.isActive,
      permissions: {
        canViewAgenda: !!staffForm.canViewAgenda,
        canEditAgenda: !!staffForm.canEditAgenda,
        canEditInventory: !!staffForm.canEditInventory,
        canViewFinance: !!staffForm.canViewFinance,
      },
    };
    staffMutation.mutate(payload);
  };

  return (
    <section className="config-section staff-section">
      <p className="config-desc">
        Cadastre sua equipe, defina cargos (um ou mais por pessoa), permissões de acesso e envie o login pelo WhatsApp.
      </p>
      <div className="staff-header">
        <button type="button" className="ui-btn ui-btn-primary-gestao" onClick={openNewStaff}>
          + Novo profissional
        </button>
      </div>
      <div className="staff-list">
        {professionals.map((p) => {
          const phoneDigits = (p.phone || '').replace(/\D/g, '');
          const hasLogin = !!p.userId && !!p.email;
          const waLink = phoneDigits
            ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(
                `Olá, ${p.name}! Seu acesso ao painel Patatinha:\nSite: https://patatinha-petshop.web.app\nLogin: ${p.email || ''}\nSenha inicial: 123456\n\nRecomendamos alterar a senha no primeiro acesso.`
              )}`
            : null;
          const rolesList = Array.isArray(p.roles) ? p.roles : [];
          return (
            <div key={p.id} className="staff-card">
              <div className="staff-main">
                <div className="staff-avatar">{(p.name?.[0] || '?').toUpperCase()}</div>
                <div className="staff-info">
                  <h3>{p.name}</h3>
                  <p className="staff-meta">
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    <span className={p.isActive ? 'staff-badge active' : 'staff-badge'}>
                      {p.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                  {rolesList.length > 0 && (
                    <div className="staff-roles">
                      {rolesList.map((id) => (
                        <span key={id} className="staff-role-badge">
                          {CARGO_LABEL[id] || id}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.specialties?.length > 0 && rolesList.length === 0 && (
                    <p className="staff-specialties">{p.specialties.join(', ')}</p>
                  )}
                </div>
              </div>
              <div className="staff-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary staff-btn-editar"
                  onClick={() => openEditStaff(p)}
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  className="ui-btn ui-btn-primary-gestao staff-btn-acesso"
                  onClick={() => createLoginMutation.mutate(p.id)}
                  disabled={!p.email || createLoginMutation.isPending}
                  title={!p.email ? 'Cadastre um e-mail no profissional para criar acesso' : ''}
                >
                  {hasLogin ? '🔄 Atualizar acesso' : '🔑 Criar acesso'}
                </button>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn-ghost staff-whatsapp">
                    📱 Enviar via WhatsApp
                  </a>
                )}
                {p.isActive !== false && !p.deleted_at && (
                  <button
                    type="button"
                    className="ui-btn ui-btn-ghost staff-btn-desativar"
                    onClick={() => { setDeactivateTarget(p); setDeactivateReason(''); }}
                  >
                    Desativar
                  </button>
                )}
              </div>
              {!p.email && (
                <p className="staff-hint-email">Adicione um e-mail ao profissional e clique em &quot;Criar acesso&quot; para liberar o login.</p>
              )}
            </div>
          );
        })}
        {professionals.length === 0 && (
          <p className="config-info">Nenhum profissional cadastrado ainda. Clique em &quot;+ Novo profissional&quot; para começar.</p>
        )}
      </div>

      {staffCredentials && (
        <div className="staff-credentials-hint">
          <p><strong>Login criado/atualizado:</strong> {staffCredentials.login}</p>
          <p><strong>Senha inicial:</strong> 123456</p>
        </div>
      )}

      {staffModalOpen && (
        <div className="modal-overlay" onClick={() => !staffMutation.isPending && setStaffModalOpen(false)}>
          <div className="modal-content modal-staff" onClick={(e) => e.stopPropagation()}>
            <h3>{editingStaff ? 'Editar profissional' : 'Novo profissional'}</h3>
            <form onSubmit={handleSubmitStaff}>
              <div className="modal-staff-form-wrap">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail (para acesso ao sistema)</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="form-group cargos-group">
                <h4>🐾 Equipe Operacional e Técnica</h4>
                <p className="form-hint-cargo">Um profissional pode ter mais de um cargo.</p>
                <div className="cargos-list">
                  {CARGOS_OPERACIONAL.map((c) => (
                    <label key={c.id} className="cargo-checkbox">
                      <input
                        type="checkbox"
                        checked={staffForm.roles.includes(c.id)}
                        onChange={() => toggleRole(c.id)}
                      />
                      <span className="cargo-label">{c.label}</span>
                      <span className="cargo-desc">{c.desc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group cargos-group">
                <h4>💼 Equipe de Atendimento e Vendas</h4>
                <div className="cargos-list">
                  {CARGOS_ATENDIMENTO.map((c) => (
                    <label key={c.id} className="cargo-checkbox">
                      <input
                        type="checkbox"
                        checked={staffForm.roles.includes(c.id)}
                        onChange={() => toggleRole(c.id)}
                      />
                      <span className="cargo-label">{c.label}</span>
                      <span className="cargo-desc">{c.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Especialidades (opcional)</label>
                <input
                  type="text"
                  value={staffForm.specialties}
                  onChange={(e) => setStaffForm((f) => ({ ...f, specialties: e.target.value }))}
                  placeholder="Ex.: banho, tosa, raças grandes"
                />
              </div>
              <div className="form-group form-group-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={staffForm.isActive}
                    onChange={(e) => setStaffForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Profissional ativo</span>
                </label>
              </div>
              <div className="form-group permissions-group">
                <h4>Permissões no sistema</h4>
                <p className="form-hint-cargo">Acessos diferenciados conforme o cargo.</p>
                <label>
                  <input
                    type="checkbox"
                    checked={staffForm.canViewAgenda}
                    onChange={(e) => setStaffForm((f) => ({ ...f, canViewAgenda: e.target.checked }))}
                  />
                  <span>Ver agenda</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={staffForm.canEditAgenda}
                    onChange={(e) => setStaffForm((f) => ({ ...f, canEditAgenda: e.target.checked }))}
                  />
                  <span>Criar/editar agendamentos</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={staffForm.canEditInventory}
                    onChange={(e) => setStaffForm((f) => ({ ...f, canEditInventory: e.target.checked }))}
                  />
                  <span>Editar estoque</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={staffForm.canViewFinance}
                    onChange={(e) => setStaffForm((f) => ({ ...f, canViewFinance: e.target.checked }))}
                  />
                  <span>Ver financeiro</span>
                </label>
              </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => setStaffModalOpen(false)}
                  disabled={staffMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ui-btn ui-btn-primary-gestao"
                  disabled={staffMutation.isPending}
                >
                  {staffMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivateTarget && (
        <div className="modal-overlay" onClick={() => !deactivateMutation.isPending && setDeactivateTarget(null)}>
          <div className="modal-content modal-staff modal-deactivate" onClick={(e) => e.stopPropagation()}>
            <h3>Desativar profissional</h3>
            <p className="form-hint-cargo">O profissional &quot;{deactivateTarget.name}&quot; será desativado e não aparecerá nas listas ativas. O histórico de agendamentos será preservado. Apenas Gestor ou Super Admin pode realizar esta ação.</p>
            <div className="form-group">
              <label>Motivo da desativação *</label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Ex.: Saída da empresa, erro de cadastro..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setDeactivateTarget(null)} disabled={deactivateMutation.isPending}>
                Cancelar
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => {
                  if (!deactivateReason.trim()) { alert('Informe o motivo da desativação.'); return; }
                  deactivateMutation.mutate({ id: deactivateTarget.id, reason: deactivateReason.trim() });
                }}
                disabled={deactivateMutation.isPending || !deactivateReason.trim()}
              >
                {deactivateMutation.isPending ? 'Desativando...' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
