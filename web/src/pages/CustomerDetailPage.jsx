import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI, petsAPI, appointmentsAPI } from '../services/api';
import './CustomerDetailPage.css';

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Pássaro' },
  { value: 'rabbit', label: 'Coelho' },
  { value: 'other', label: 'Outro' },
];

const SERVICE_LABEL = { banho: 'Banho', tosa: 'Tosa', banho_tosa: 'Banho e Tosa', veterinario: 'Consulta', hotel: 'Hotel', outros: 'Outros' };
const STATUS_LABEL = { confirmed: 'Confirmado', checked_in: 'Check-in', in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' };
const TABS = ['info', 'pets', 'agendamentos', 'faturamento', 'anotacoes'];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [addPetForm, setAddPetForm] = useState({ name: '', species: 'dog', breed: '', age: '', birthDate: '' });
  const [cancelAptOpen, setCancelAptOpen] = useState(false);
  const [cancelAptTarget, setCancelAptTarget] = useState(null);
  const [cancelAptReason, setCancelAptReason] = useState('');
  const [cancelAllOpen, setCancelAllOpen] = useState(false);
  const [cancelAllReason, setCancelAllReason] = useState('');

  const { data: customerData, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersAPI.getById(id).then((r) => r.data),
    enabled: !!id,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments-customer', id],
    queryFn: () => appointmentsAPI.getAll({ customerId: id }).then((r) => r.data),
    enabled: !!id && activeTab === 'agendamentos',
  });

  const customer = customerData?.customer ?? customerData;
  const pets = Array.isArray(customer?.pets) ? customer.pets : (customerData?.pets ?? []);
  const appointments = appointmentsData?.appointments ?? [];

  const phone = customer?.phone || '';
  const whatsappUrl = phone
    ? 'https://wa.me/55' + phone.replace(/\D/g, '')
    : '#';

  const editMutation = useMutation({
    mutationFn: (body) => customersAPI.update(customer.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditOpen(false);
    },
    onError: (err) => {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.error || err.message || 'Erro ao atualizar cliente.');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => customersAPI.deactivate(customer.id, deactivateReason.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeactivateOpen(false);
      setDeactivateReason('');
      navigate('/gestao/customers');
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Não foi possível desativar. Apenas Gestor ou Super Admin pode desativar.');
    },
  });

  const addPetMutation = useMutation({
    mutationFn: (body) => petsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setAddPetOpen(false);
      setAddPetForm({ name: '', species: 'dog', breed: '', age: '', birthDate: '' });
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Erro ao cadastrar pet.');
    },
  });

  const cancelAptMutation = useMutation({
    mutationFn: ({ aptId, reason }) => appointmentsAPI.cancel(aptId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments-customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCancelAptOpen(false);
      setCancelAptTarget(null);
      setCancelAptReason('');
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Não foi possível cancelar o agendamento.');
    },
  });

  const cancelAllAppointmentsMutation = useMutation({
    mutationFn: (reason) => appointmentsAPI.cancelAllByCustomer(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments-customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setCancelAllOpen(false);
      setCancelAllReason('');
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Não foi possível cancelar os agendamentos.');
    },
  });

  const openEditModal = () => {
    setEditForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setEditOpen(true);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      // eslint-disable-next-line no-alert
      alert('Nome e telefone são obrigatórios.');
      return;
    }
    editMutation.mutate({
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim() || undefined,
      address: editForm.address.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
    });
  };

  if (loadingCustomer && !customer) {
    return <div className="loading">Carregando...</div>;
  }

  if (!customer) {
    return (
      <div className="customer-detail">
        <p>Cliente nao encontrado.</p>
        <Link to="/gestao/customers" className="back-link">Voltar para Clientes</Link>
      </div>
    );
  }

  return (
    <div className="customer-detail">
      <Link to="/gestao/customers" className="back-link">Voltar para Clientes</Link>

      <div className="customer-header">
        <div className="customer-avatar-lg">
          {(customer.name?.[0] || '?').toUpperCase()}
        </div>
        <div className="customer-main">
          <h1>{customer.name || 'Sem nome'}</h1>
          {customer.phone && <p>Telefone: {customer.phone}</p>}
          {customer.email && <p>Email: {customer.email}</p>}
          <div className="customer-resumo">
            <span><strong>Último atendimento:</strong> {customer.lastVisit || '-'}</span>
            <span><strong>Total gasto:</strong> {customer.totalSpent != null ? `R$ ${Number(customer.totalSpent).toFixed(2)}` : '-'}</span>
          </div>
          <div className="header-actions">
            <button type="button" className="ui-btn ui-btn-secondary btn-editar" onClick={openEditModal}>
              Editar
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary-gestao btn-agendar-header"
              onClick={() => navigate('/gestao/appointments', { state: { customerId: customer.id, customerName: customer.name } })}
            >
              Agendar serviço
            </button>
            {customer.is_active !== false && (
              <button
                type="button"
                className="ui-btn ui-btn-ghost btn-desativar"
                onClick={() => setDeactivateOpen(true)}
              >
                Excluir cliente
              </button>
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
              aria-label="WhatsApp"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="customer-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <section>
            <h3>Informações</h3>
            <dl className="info-list">
              {customer?.address && <><dt>Endereço</dt><dd>{customer.address}</dd></>}
              {customer?.notes && <><dt>Observações</dt><dd>{customer.notes}</dd></>}
              {!customer?.address && !customer?.notes && <dd>Nenhuma informação adicional.</dd>}
            </dl>
          </section>
        )}
        {activeTab === 'pets' && (
          <section>
            <div className="pets-tab-header">
              <h3>Pets</h3>
              <button type="button" className="ui-btn ui-btn-primary-gestao btn-add-pet" onClick={() => setAddPetOpen(true)}>
                + Adicionar pet
              </button>
            </div>
            <ul className="pets-list">
              {pets.length ? (
                pets.map((pet) => (
                  <li key={pet.id}>
                    <Link to={`/gestao/pets/${pet.id}`}>{pet.name || 'Pet'}</Link>
                    {pet.breed && <span className="pet-meta"> – {pet.breed}</span>}
                  </li>
                ))
              ) : (
                <li>Nenhum pet cadastrado.</li>
              )}
            </ul>
            {addPetOpen && (
              <div className="modal-overlay" onClick={() => !addPetMutation.isPending && setAddPetOpen(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Novo pet</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!addPetForm.name.trim()) {
                      alert('Nome do pet é obrigatório.');
                      return;
                    }
                    const payload = {
                      name: addPetForm.name.trim(),
                      species: addPetForm.species,
                      breed: addPetForm.breed.trim() || undefined,
                      customerId: customer.id,
                    };
                    if (addPetForm.birthDate) payload.birthDate = addPetForm.birthDate;
                    if (addPetForm.age !== '') payload.age = parseInt(addPetForm.age, 10);
                    if (!payload.age && !payload.birthDate) {
                      alert('Informe a idade ou a data de nascimento.');
                      return;
                    }
                    addPetMutation.mutate(payload);
                  }}>
                    <div className="form-group">
                      <label>Nome *</label>
                      <input
                        type="text"
                        value={addPetForm.name}
                        onChange={(e) => setAddPetForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        placeholder="Nome do pet"
                      />
                    </div>
                    <div className="form-group">
                      <label>Espécie</label>
                      <select
                        value={addPetForm.species}
                        onChange={(e) => setAddPetForm((f) => ({ ...f, species: e.target.value }))}
                      >
                        {SPECIES_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Raça</label>
                      <input
                        type="text"
                        value={addPetForm.breed}
                        onChange={(e) => setAddPetForm((f) => ({ ...f, breed: e.target.value }))}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Idade (anos)</label>
                        <input
                          type="number"
                          min="0"
                          value={addPetForm.age}
                          onChange={(e) => setAddPetForm((f) => ({ ...f, age: e.target.value }))}
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Data nasc.</label>
                        <input
                          type="date"
                          value={addPetForm.birthDate}
                          onChange={(e) => setAddPetForm((f) => ({ ...f, birthDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setAddPetOpen(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="ui-btn ui-btn-primary-gestao" disabled={addPetMutation.isPending}>
                        {addPetMutation.isPending ? 'Salvando...' : 'Cadastrar pet'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'agendamentos' && (
          <section>
            <div className="agendamentos-tab-header">
              <h3>Agendamentos / Tickets</h3>
              {appointments.filter((a) => a.status !== 'cancelled').length > 0 && (
                <button
                  type="button"
                  className="ui-btn ui-btn-ghost btn-excluir-todos"
                  onClick={() => { setCancelAllReason(''); setCancelAllOpen(true); }}
                >
                  Excluir todos os atendimentos
                </button>
              )}
            </div>
            {appointments.length === 0 ? (
              <p>Nenhum agendamento.</p>
            ) : (
              <ul className="customer-appointments-list">
                {appointments.map((a) => (
                  <li key={a.id} className={`status-${a.status}`}>
                    <span className="apt-date">{a.date}</span>
                    <span className="apt-time">{a.time}</span>
                    <span className="apt-pet">{a.petName || 'Pet'}</span>
                    <span className="apt-service">{SERVICE_LABEL[a.service] || a.service}</span>
                    <span className="apt-status">{STATUS_LABEL[a.status] || a.status}</span>
                    {a.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="ui-btn ui-btn-ghost btn-cancel-apt"
                        onClick={() => { setCancelAptTarget(a); setCancelAptReason(''); setCancelAptOpen(true); }}
                      >
                        Excluir ticket
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {activeTab === 'faturamento' && (
          <section>
            <h3>Faturamento</h3>
            <p>Faturamento do cliente sera exibido aqui.</p>
          </section>
        )}
        {activeTab === 'anotacoes' && (
          <section>
            <h3>Anotacoes</h3>
            <p>Anotacoes do cliente serao exibidas aqui.</p>
          </section>
        )}
      </div>

      {editOpen && (
        <div className="modal-overlay" onClick={() => !editMutation.isPending && setEditOpen(false)}>
          <div className="modal-content modal-edit-customer" onClick={(e) => e.stopPropagation()}>
            <h3>Editar cliente</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Observações internas</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => setEditOpen(false)}
                  disabled={editMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ui-btn ui-btn-primary-gestao"
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivateOpen && (
        <div className="modal-overlay" onClick={() => !deactivateMutation.isPending && setDeactivateOpen(false)}>
          <div className="modal-content modal-deactivate" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir cliente</h3>
            <p className="modal-deactivate-desc">
              O cliente será desativado e não aparecerá nas listas. Todos os dados do cadastro ficarão ocultos (histórico preservado no sistema). Apenas Gestor ou Super Admin pode realizar esta ação.
            </p>
            <div className="form-group">
              <label htmlFor="customer-deactivate-reason">Motivo da exclusão *</label>
              <textarea
                id="customer-deactivate-reason"
                name="customer-deactivate-reason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Ex.: Erro de cadastro, solicitação do cliente..."
                rows={3}
                required
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="ui-btn ui-btn-secondary"
                onClick={() => setDeactivateOpen(false)}
                disabled={deactivateMutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => {
                  if (!deactivateReason.trim()) {
                    alert('Informe o motivo da exclusão.');
                    return;
                  }
                  deactivateMutation.mutate();
                }}
                disabled={deactivateMutation.isPending || !deactivateReason.trim()}
              >
                {deactivateMutation.isPending ? 'Excluindo...' : 'Excluir cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelAptOpen && cancelAptTarget && (
        <div className="modal-overlay" onClick={() => !cancelAptMutation.isPending && setCancelAptOpen(false)}>
          <div className="modal-content modal-deactivate" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir ticket</h3>
            <p className="modal-deactivate-desc">
              Cancelar agendamento de {cancelAptTarget.date} às {cancelAptTarget.time} – {SERVICE_LABEL[cancelAptTarget.service] || cancelAptTarget.service}?
            </p>
            <div className="form-group">
              <label>Justificativa *</label>
              <textarea
                value={cancelAptReason}
                onChange={(e) => setCancelAptReason(e.target.value)}
                placeholder="Motivo do cancelamento"
                rows={2}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setCancelAptOpen(false)} disabled={cancelAptMutation.isPending}>
                Cancelar
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => {
                  if (!cancelAptReason.trim()) { alert('Informe a justificativa.'); return; }
                  cancelAptMutation.mutate({ aptId: cancelAptTarget.id, reason: cancelAptReason.trim() });
                }}
                disabled={cancelAptMutation.isPending || !cancelAptReason.trim()}
              >
                {cancelAptMutation.isPending ? 'Excluindo...' : 'Excluir ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelAllOpen && (
        <div className="modal-overlay" onClick={() => !cancelAllAppointmentsMutation.isPending && setCancelAllOpen(false)}>
          <div className="modal-content modal-deactivate" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir todos os atendimentos</h3>
            <p className="modal-deactivate-desc">
              Todos os agendamentos ativos deste cliente serão cancelados. Esta ação não remove o cadastro do cliente nem os pets.
            </p>
            <div className="form-group">
              <label>Justificativa *</label>
              <textarea
                value={cancelAllReason}
                onChange={(e) => setCancelAllReason(e.target.value)}
                placeholder="Motivo do cancelamento"
                rows={2}
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="ui-btn ui-btn-secondary" onClick={() => setCancelAllOpen(false)} disabled={cancelAllAppointmentsMutation.isPending}>
                Cancelar
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => {
                  if (!cancelAllReason.trim()) { alert('Informe a justificativa.'); return; }
                  cancelAllAppointmentsMutation.mutate(cancelAllReason.trim());
                }}
                disabled={cancelAllAppointmentsMutation.isPending || !cancelAllReason.trim()}
              >
                {cancelAllAppointmentsMutation.isPending ? 'Excluindo...' : 'Excluir todos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
