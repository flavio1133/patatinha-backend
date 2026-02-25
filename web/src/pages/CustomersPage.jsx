import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI, petsAPI } from '../services/api';
import './CustomersPage.css';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('tabela');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    petName: '',
    petSpecies: 'dog',
    petAge: '',
  });

  useEffect(() => {
    if (modalOpen) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [modalOpen]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersAPI.getAll(search).then((res) => res.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => {
      // 1) Criar cliente
      const res = await customersAPI.create(body);
      const created = res.data?.customer || res.data;

      // 2) Se veio pet preenchido, criar pet vinculado
      if (created?.id && form.petName.trim()) {
        const petPayload = {
          name: form.petName.trim(),
          species: form.petSpecies || 'dog',
          age: form.petAge ? parseInt(form.petAge, 10) : undefined,
          customerId: created.id,
        };
        try {
          await petsAPI.create(petPayload);
        } catch (err) {
          // Não bloqueia o fluxo, apenas alerta
          // eslint-disable-next-line no-alert
          alert(err.response?.data?.error || 'Cliente criado, mas houve erro ao criar o pet.');
        }
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setModalOpen(false);
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        petName: '',
        petSpecies: 'dog',
        petAge: '',
      });
    },
    onError: (err) => {
      alert(err.response?.data?.error || err.message || 'Erro ao cadastrar cliente.');
    },
  });

  const customers = data !== undefined ? (data?.customers || []) : [];
  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.phone && c.phone.includes(search))
    );
  }, [customers, search]);

  const stats = useMemo(() => ({
    total: customers.length,
    ativos: customers.filter((c) => (c.lastVisit ? true : (c.petsCount ?? 0) > 0)).length,
    inativos: customers.filter((c) => !c.lastVisit && (c.petsCount ?? 0) === 0).length,
    ticketMedio: customers.length ? 85 : 0,
  }), [customers]);

  const handleSubmitNewCustomer = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Nome e telefone são obrigatórios.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="customers-page">
      <div className="customers-stats">
        <div className="stat-mini"><span>{stats.total}</span> Total</div>
        <div className="stat-mini"><span>{stats.ativos}</span> Ativos</div>
        <div className="stat-mini"><span>{stats.inativos}</span> Inativos</div>
        <div className="stat-mini"><span>R$ {stats.ticketMedio}</span> Ticket médio</div>
      </div>
      <div className="page-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nome, telefone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button type="button" className={viewMode === 'tabela' ? 'active' : ''} onClick={() => setViewMode('tabela')}>Tabela</button>
          <button type="button" className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>Cards</button>
          <button type="button" className="ui-btn ui-btn-primary-gestao" onClick={() => setModalOpen(true)}>+ Novo Cliente</button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="loading">Carregando...</div>
      ) : isError ? (
        <div className="customers-error">
          <p>Não foi possível carregar os clientes. Verifique a conexão e se a API está online (Render).</p>
          <button type="button" className="btn-primary" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      ) : viewMode === 'tabela' ? (
        <div className="customers-table-wrap">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Pets</th>
                <th>Último atendimento</th>
                <th>Total gasto</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/gestao/customers/${c.id}`} className="customer-link">
                      <span className="customer-avatar-sm">{(c.name?.[0] || '?').toUpperCase()}</span>
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.phone}<br />{c.email || '-'}</td>
                  <td>{c.petsCount ?? 0}</td>
                  <td>{c.lastVisit || '-'}</td>
                  <td>{c.totalSpent ? `R$ ${c.totalSpent}` : '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="ui-btn ui-btn-secondary btn-agendar-rapido"
                      onClick={() => navigate('/gestao/appointments', { state: { customerId: c.id, customerName: c.name } })}
                    >
                      Agendar serviço
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="customers-grid">
          {filtered.map((customer) => (
            <div key={customer.id} className="customer-card">
              <Link to={`/gestao/customers/${customer.id}`} className="customer-card-main">
                <div className="customer-avatar">
                  {(customer.name && customer.name[0]) ? customer.name[0].toUpperCase() : '?'}
                </div>
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <p>📞 {customer.phone}</p>
                  {customer.email && <p>✉️ {customer.email}</p>}
                  {((customer.petsCount ?? 0) > 0) && <p>🐾 {customer.petsCount} pet(s)</p>}
                </div>
              </Link>
              <div className="customer-card-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary btn-agendar-rapido"
                  onClick={() => navigate('/gestao/appointments', { state: { customerId: customer.id, customerName: customer.name } })}
                >
                  Agendar serviço
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content modal-new-customer" onClick={(e) => e.stopPropagation()}>
            <h3>Novo cliente</h3>
            <form onSubmit={handleSubmitNewCustomer}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div className="form-group">
                <label>Observações internas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ex.: prefere atendimento aos sábados, tem alergia, etc. (visível só para a equipe)"
                  rows={2}
                />
              </div>

              <div className="form-group form-group-pet">
                <h4>Primeiro pet (opcional, mas recomendado)</h4>
                <p className="form-hint">
                  Esses dados já deixam o cadastro pronto para agendar serviços para este cliente.
                </p>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do pet</label>
                    <input
                      type="text"
                      value={form.petName}
                      onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
                      placeholder="Ex.: Rex"
                    />
                  </div>
                  <div className="form-group">
                    <label>Espécie</label>
                    <select
                      value={form.petSpecies}
                      onChange={(e) => setForm((f) => ({ ...f, petSpecies: e.target.value }))}
                    >
                      <option value="dog">Cachorro</option>
                      <option value="cat">Gato</option>
                      <option value="bird">Pássaro</option>
                      <option value="rabbit">Coelho</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Idade aprox. (anos)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.petAge}
                      onChange={(e) => setForm((f) => ({ ...f, petAge: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group senha-padrao-hint">
                <strong>Senha inicial do cliente:</strong> <code>123456</code>
                <p>Informe essa senha ao cliente no primeiro acesso. Depois ele poderá alterar em "Meu perfil &gt; Alterar senha".</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="ui-btn ui-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ui-btn ui-btn-primary-gestao"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
