import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, petsAPI } from '../services/api';
import './ClienteAgendarPage.css';

const SERVICOS = [
  { value: 'banho', label: 'Banho' },
  { value: 'tosa', label: 'Tosa' },
  { value: 'banho_tosa', label: 'Banho e Tosa' },
  { value: 'veterinario', label: 'Consulta / Veterinario' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'outros', label: 'Outros' },
];

function getDaysNext(days) {
  const result = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push(d);
  }
  return result;
}

export default function ClienteAgendarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [petId, setPetId] = useState('');
  const [service, setService] = useState('banho_tosa');
  const [professionalId, setProfessionalId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const calendarDays = useMemo(() => getDaysNext(30), []);

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ['availability', selectedDate, service],
    queryFn: () => appointmentsAPI.getAvailability(selectedDate, service).then((res) => res.data),
    enabled: !!selectedDate && !!service,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body) => appointmentsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-appointments'] });
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/cliente/home'), 2000);
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao agendar. Tente outro horario.'),
  });

  const pets = petsData?.pets || [];
  const availability = availabilityData?.availability || [];
  const availabilityFiltered = useMemo(() => {
    if (!professionalId) return availability;
    return availability.filter((a) => String(a.professionalId) === String(professionalId));
  }, [availability, professionalId]);
  const allSlots = useMemo(() => {
    const set = new Set();
    availabilityFiltered.forEach((a) => (a.availableSlots || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [availabilityFiltered]);
  const professionalOptions = useMemo(() => {
    if (!availability.length) return [];
    return availability.map((a) => ({ id: a.professionalId, name: a.professionalName || 'Profissional' }));
  }, [availability]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!petId) { setError('Selecione um pet.'); return; }
    if (!selectedDate) { setError('Selecione a data.'); return; }
    if (!time) { setError('Selecione o horario.'); return; }
    createMutation.mutate({
      petId: parseInt(petId, 10),
      service,
      date: selectedDate,
      time,
      notes: notes.trim() || undefined,
      professionalId: professionalId ? parseInt(professionalId, 10) : undefined,
    });
  };

  const dateStr = (d) => d.toISOString().split('T')[0];

  if (success) {
    return (
      <div className="cliente-agendar">
        <div className="cliente-agendar-card">
          <h1>Agendado!</h1>
          <p>Seu agendamento foi confirmado. Redirecionando...</p>
          <Link to="/cliente/home" className="btn-voltar">Ir para Inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cliente-page cliente-agendar-page">
      <header className="cliente-page-header">
        <h1>Agendar servico</h1>
        <p className="cliente-sub">Pet, servico, data e horarios disponiveis.</p>
      </header>

      {pets.length === 0 ? (
        <div className="cliente-card agendar-empty">
          <p>Voce ainda nao tem pets cadastrados.</p>
          <Link to="/cliente/pets/novo">Cadastrar pet</Link> e depois volte para agendar.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="cliente-card form-agendar-full">
          <div className="form-row-agendar">
            <div className="form-group">
              <label>Pet *</label>
              <select value={petId} onChange={(e) => setPetId(e.target.value)} required>
                <option value="">Selecione o pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.breed ? `(${p.breed})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Servico *</label>
              <select value={service} onChange={(e) => { setService(e.target.value); setSelectedDate(''); setTime(''); setProfessionalId(''); }} required>
                {SERVICOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {selectedDate && availability.length > 0 && (
            <div className="form-group form-group-professional">
              <label>Profissional (opcional)</label>
              <select
                value={professionalId}
                onChange={(e) => { setProfessionalId(e.target.value); setTime(''); }}
              >
                <option value="">Qualquer disponivel</option>
                {professionalOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <p className="form-hint">Escolha quem vai atender ou deixe em &quot;Qualquer disponivel&quot;.</p>
            </div>
          )}

          <div className="calendar-section">
            <label>Data *</label>
            <div className="calendar-grid">
              {calendarDays.map((d) => {
                const ds = dateStr(d);
                const isSelected = selectedDate === ds;
                const isPast = ds < dateStr(new Date());
                return (
                  <button
                    key={ds}
                    type="button"
                    className={'calendar-day ' + (isSelected ? 'selected' : '') + (isPast ? ' past' : '')}
                    onClick={() => { if (!isPast) { setSelectedDate(ds); setTime(''); } }}
                    disabled={isPast}
                  >
                    <span className="day-num">{d.getDate()}</span>
                    <span className="day-month">{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="slots-section">
              <label>Horarios disponiveis * {professionalId && professionalOptions.find((o) => String(o.id) === String(professionalId)) && (
                <span className="slots-professional-hint">(conforme agenda do profissional)</span>
              )}</label>
              {loadingSlots ? (
                <p className="slots-loading">Carregando horarios...</p>
              ) : allSlots.length === 0 ? (
                <p className="slots-empty">
                  {professionalId
                    ? 'Nenhum horario disponivel para este profissional nesta data. Tente outro dia ou outro profissional.'
                    : 'Nenhum horario disponivel nesta data. Escolha outra.'}
                </p>
              ) : (
                <div className="slots-grid">
                  {allSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={'slot-btn ' + (time === t ? 'selected' : '')}
                      onClick={() => setTime(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Observacoes (opcional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Alguma informacao importante?" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-agendar-submit" disabled={createMutation.isPending || !petId || !selectedDate || !time}>
            {createMutation.isPending ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
        </form>
      )}
    </div>
  );
}
