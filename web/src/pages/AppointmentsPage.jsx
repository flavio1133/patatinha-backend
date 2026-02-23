import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { appointmentsAPI, customersAPI, petsAPI, professionalsAPI } from '../services/api';
import './AppointmentsPage.css';

// Status da API -> rótulo e filtro (usar chave da API no select)
const STATUS_API = {
  confirmed: 'Confirmado',
  checked_in: 'Check-in',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const SERVICE_OPTIONS = [
  { value: 'banho', label: 'Banho' },
  { value: 'tosa', label: 'Tosa' },
  { value: 'banho_tosa', label: 'Banho e Tosa' },
  { value: 'veterinario', label: 'Consulta veterinária' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'outros', label: 'Outros' },
];

const TIME_SLOTS = Array.from({ length: 20 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = (i % 2) * 30;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i);

function NewAppointmentModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState('');
  const [petId, setPetId] = useState('');
  const [service, setService] = useState('banho');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const { data: customersData, isError: customersError, refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getAll().then((res) => res.data),
    retry: 1,
  });
  const customers = customersData?.customers || [];

  const { data: petsData } = useQuery({
    queryKey: ['pets', customerId],
    queryFn: () => petsAPI.getAll(customerId).then((res) => res.data),
    enabled: !!customerId,
    retry: 1,
  });
  const pets = petsData?.pets || [];

  const { data: professionalsData, isError: professionalsError } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsAPI.getAll().then((res) => res.data),
    retry: 1,
  });
  const professionals = professionalsData?.professionals || [];

  const createMutation = useMutation({
    mutationFn: (body) => appointmentsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.message || 'Erro ao criar agendamento';
      alert(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!petId || !date || !time) {
      alert('Preencha cliente, pet, data e horário.');
      return;
    }
    const body = {
      petId: parseInt(petId),
      service,
      date,
      time,
      notes: notes.trim() || undefined,
      customerId: customerId ? parseInt(customerId) : undefined,
      professionalId: professionalId ? parseInt(professionalId) : undefined,
    };
    createMutation.mutate(body);
  };

  const handleCustomerChange = (e) => {
    const v = e.target.value;
    setCustomerId(v);
    setPetId('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-new-appointment" onClick={(e) => e.stopPropagation()}>
        <h3>Novo agendamento</h3>
        <form onSubmit={handleSubmit}>
          {customersError && (
            <div className="form-error-inline">
              <p>Não foi possível carregar os clientes. Verifique a conexão com o servidor (API no Render).</p>
              <button type="button" className="btn-secondary btn-sm" onClick={() => refetchCustomers()}>Tentar novamente</button>
            </div>
          )}
          <div className="form-group">
            <label>Cliente *</label>
            <select value={customerId} onChange={handleCustomerChange} required>
              <option value="">Selecione o cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Pet *</label>
            <select value={petId} onChange={(e) => setPetId(e.target.value)} required disabled={!customerId}>
              <option value="">Selecione o pet</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name} {p.breed ? `- ${p.breed}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Serviço *</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {SERVICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Profissional</label>
            <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)}>
              <option value="">Deixar sistema escolher</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Data *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Horário *</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Opcional" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function serviceLabel(service) {
  const o = SERVICE_OPTIONS.find((s) => s.value === service);
  return o ? o.label : service;
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState('dia');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPro, setFilterPro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', dateStr, view],
    queryFn: () => appointmentsAPI.getAll({ date: dateStr }).then((res) => res.data),
    retry: 1,
  });

  const checkInMutation = useMutation({
    mutationFn: (id) => appointmentsAPI.checkIn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const rawList = useMemo(() => {
    const fromApi = data?.appointments;
    if (data !== undefined && Array.isArray(fromApi)) return fromApi;
    return [];
  }, [data?.appointments, data]);
  const list = rawList.filter(
    (a) => (!filterStatus || a.status === filterStatus) && (!filterPro || a.professionalName === filterPro)
  );

  const professionals = useMemo(() => [...new Set(list.map((a) => a.professionalName).filter(Boolean))], [list]);

  const weekDays = view === 'semana'
    ? eachDayOfInterval({ start: startOfWeek(selectedDate, { weekStartsOn: 0 }), end: endOfWeek(selectedDate, { weekStartsOn: 0 }) })
    : [selectedDate];
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = view === 'mes'
    ? [
        ...Array(getDay(monthStart)).fill(null),
        ...eachDayOfInterval({ start: monthStart, end: monthEnd }),
      ]
    : [];

  const getAppointmentsForDay = (day) =>
    list.filter((a) => a.date === format(day, 'yyyy-MM-dd') || (!a.date && isSameDay(day, selectedDate)));
  const getAppointmentsForHour = (hour, day) =>
    getAppointmentsForDay(day).filter((a) => {
      const t = (a.time || '').replace(':', '');
      const h = parseInt(t.slice(0, 2), 10);
      return h === hour;
    });

  const statusDisplay = (status) => STATUS_API[status] || status;
  const canCheckIn = (status) => status === 'confirmed' || status === 'pendente';

  return (
    <div className="appointments-page">
      <div className="agenda-controls">
        <div className="agenda-date">
          <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>←</button>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <button type="button" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>→</button>
        </div>
        <div className="agenda-views">
          {['dia', 'semana', 'mes', 'lista'].map((v) => (
            <button key={v} type="button" className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {v === 'dia' ? 'Dia' : v === 'semana' ? 'Semana' : v === 'mes' ? 'Mês' : 'Lista'}
            </button>
          ))}
        </div>
        <div className="agenda-filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos status</option>
            {Object.entries(STATUS_API).map(([k, lbl]) => (
              <option key={k} value={k}>{lbl}</option>
            ))}
          </select>
          <select value={filterPro} onChange={(e) => setFilterPro(e.target.value)}>
            <option value="">Todos profissionais</option>
            {professionals.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>+ Novo agendamento</button>
      </div>

      {isLoading && !data ? (
        <div className="loading">Carregando...</div>
      ) : isError ? (
        <div className="agenda-error">
          <p><strong>Não foi possível carregar a agenda.</strong></p>
          <p>Verifique: (1) você está logado como empresa; (2) a conexão com a internet; (3) se o servidor da API está online (Render).</p>
          <button type="button" className="btn-primary" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      ) : view === 'dia' ? (
        <div className="agenda-day">
          {list.length === 0 ? (
            <div className="agenda-empty">
              <p>Nenhum agendamento nesta data.</p>
              <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>+ Novo agendamento</button>
            </div>
          ) : (
          <div className="agenda-timeline">
            {HOURS.map((h) => (
              <div key={h} className="timeline-row">
                <div className="timeline-hour">{String(h).padStart(2, '0')}:00</div>
                <div className="timeline-slots">
                  {getAppointmentsForHour(h, selectedDate).map((apt) => (
                    <div key={apt.id} className={`timeline-block status-${apt.status}`}>
                      <strong>{apt.petName || 'Pet'}</strong>
                      <span>{serviceLabel(apt.service)}</span>
                      <span className="block-pro">{apt.professionalName}</span>
                      <div className="block-actions">
                        {canCheckIn(apt.status) && (
                          <button type="button" title="Check-in" onClick={() => checkInMutation.mutate(apt.id)}>✓</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      ) : view === 'semana' ? (
        <div className="agenda-week">
          <div className="week-header">
            {weekDays.map((d) => (
              <div key={d.toISOString()} className="week-col">
                <div className="week-day-label">{format(d, 'EEE dd', { locale: ptBR })}</div>
                {getAppointmentsForDay(d).map((apt) => (
                  <div key={apt.id} className={`week-block status-${apt.status}`}>
                    {apt.time} {apt.petName} - {serviceLabel(apt.service)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {list.length === 0 && (
            <p className="agenda-empty-msg">Nenhum agendamento nesta semana.</p>
          )}
        </div>
      ) : view === 'mes' ? (
        <div className="agenda-month">
          <h3>{format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</h3>
          <div className="month-grid">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((w) => (
              <div key={w} className="month-cell month-header">{w}</div>
            ))}
            {monthDays.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} className="month-cell empty" />;
              const dayApts = getAppointmentsForDay(d);
              return (
                <div
                  key={d.toISOString()}
                  className={`month-cell ${isSameDay(d, selectedDate) ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <span className="month-day">{format(d, 'd')}</span>
                  {dayApts.length > 0 && <span className="month-dots">•</span>}
                </div>
              );
            })}
          </div>
          {list.length === 0 && (
            <p className="agenda-empty-msg">Nenhum agendamento neste mês.</p>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {list.length === 0 ? (
            <div className="agenda-empty">
              <p>Nenhum agendamento nesta data.</p>
              <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>+ Novo agendamento</button>
            </div>
          ) : (
          <>
          {list.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-time">{apt.time}</div>
              <div className="appointment-info">
                <h3>{apt.petName || 'Pet #' + apt.petId}</h3>
                <p>{serviceLabel(apt.service)}</p>
                {apt.professionalName && <p className="professional">👤 {apt.professionalName}</p>}
              </div>
              <div className={'appointment-status status-' + (apt.status || '').replace(' ', '_')}>
                {statusDisplay(apt.status)}
              </div>
              <div className="appointment-actions">
                {canCheckIn(apt.status) && (
                  <button type="button" className="btn-icon" title="Check-in" onClick={() => checkInMutation.mutate(apt.id)}>✓</button>
                )}
              </div>
            </div>
          ))}
          </>
          )}
        </div>
      )}

      {modalOpen && (
        <NewAppointmentModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
