import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI, petsAPI, appointmentsAPI } from '../services/api';
import './CustomerDetailPage.css';

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
            <h3>Pets</h3>
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
          </section>
        )}
        {activeTab === 'agendamentos' && (
          <section>
            <h3>Agendamentos</h3>
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
    </div>
  );
}
