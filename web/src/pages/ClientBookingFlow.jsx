import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBooking } from '../contexts/BookingContext';
import { useCompany } from '../contexts/CompanyContext';
import { appointmentsAPI, petsAPI, companiesAPI } from '../services/api';
import './ClientBookingFlow.css';

const SERVICOS = [
  { value: 'banho', label: 'Banho' },
  { value: 'tosa', label: 'Tosa' },
  { value: 'banho_tosa', label: 'Banho e Tosa' },
  { value: 'veterinario', label: 'Consulta / Veterinário' },
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

const dateStr = (d) => d.toISOString().split('T')[0];

export default function ClientBookingFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { companyId } = useCompany();
  const { step, currentStepName, booking, updateBooking, nextStep, prevStep, reset } = useBooking();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const calendarDays = useMemo(() => getDaysNext(30), []);

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  // Disponibilidade: se vinculado à empresa, usa rota pública por companyId; senão usa /appointments/availability (com auth)
  const getAvailabilityFn = (d, s) =>
    companyId
      ? companiesAPI.getAvailability(companyId, d, s).then((res) => res.data)
      : appointmentsAPI.getAvailability(d, s).then((res) => res.data);

  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ['availability', companyId, booking.date, booking.service],
    queryFn: () => getAvailabilityFn(booking.date, booking.service),
    enabled: !!booking.date && !!booking.service,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body) => appointmentsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-appointments'] });
      reset();
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/cliente/agendamentos'), 2000);
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao agendar. Tente outro horário.'),
  });

  const pets = petsData?.pets || [];
  const availability = availabilityData?.availability || [];
  const allSlots = useMemo(() => {
    const set = new Set();
    availability.forEach((a) => (a.availableSlots || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [availability]);

  const handleConfirm = () => {
    setError('');
    if (!booking.petId || !booking.date || !booking.time) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    createMutation.mutate({
      petId: parseInt(booking.petId, 10),
      service: booking.service,
      date: booking.date,
      time: booking.time,
      notes: booking.notes?.trim() || undefined,
    });
  };

  if (success) {
    return (
      <div className="client-booking-flow client-booking-success">
        <div className="client-booking-card">
          <h1>Agendado!</h1>
          <p>Seu agendamento foi confirmado. Redirecionando...</p>
          <Link to="/cliente/home" className="btn-voltar-booking">Ir para Início</Link>
        </div>
      </div>
    );
  }

  const stepLabels = ['Pet', 'Serviço', 'Data e Horário', 'Confirmar'];
  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="client-booking-flow">
      <header className="client-booking-header">
        <h1>Agendar serviço</h1>
        <div className="client-booking-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="client-booking-step-label">Etapa {step + 1} de 4: {stepLabels[step]}</p>
      </header>

      {pets.length === 0 ? (
        <div className="cliente-card agendar-empty">
          <p>Você ainda não tem pets cadastrados.</p>
          <Link to="/cliente/pets/novo">Cadastrar pet</Link> e depois volte para agendar.
        </div>
      ) : (
        <div className="client-booking-steps">
          {currentStepName === 'pet' && (
            <div className="client-booking-step">
              <label>Selecione o pet *</label>
              <div className="pet-select-grid">
                {pets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={'pet-select-btn' + (booking.petId === p.id ? ' selected' : '')}
                    onClick={() => updateBooking({ petId: p.id, pet: p })}
                  >
                    <span className="pet-emoji">{(p.species || '').toLowerCase() === 'cat' ? '🐈' : '🐕'}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStepName === 'service' && (
            <div className="client-booking-step">
              <label>Selecione o serviço *</label>
              <select
                value={booking.service}
                onChange={(e) => updateBooking({ service: e.target.value })}
                className="service-select"
              >
                {SERVICOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {currentStepName === 'datetime' && (
            <div className="client-booking-step">
              <label>Data *</label>
              <div className="calendar-grid-booking">
                {calendarDays.map((d) => {
                  const ds = dateStr(d);
                  const isSelected = booking.date === ds;
                  const isPast = ds < dateStr(new Date());
                  return (
                    <button
                      key={ds}
                      type="button"
                      className={'calendar-day' + (isSelected ? ' selected' : '') + (isPast ? ' past' : '')}
                      onClick={() => {
                        if (!isPast) updateBooking({ date: ds, time: '' });
                      }}
                      disabled={isPast}
                    >
                      <span className="day-num">{d.getDate()}</span>
                      <span className="day-month">{d.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    </button>
                  );
                })}
              </div>
              {booking.date && (
                <>
                  <label>Horários disponíveis *</label>
                  {loadingSlots ? (
                    <p className="slots-loading">Carregando...</p>
                  ) : allSlots.length === 0 ? (
                    <p className="slots-empty">Nenhum horário nesta data. Escolha outra.</p>
                  ) : (
                    <div className="slots-grid-booking">
                      {allSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={'slot-btn' + (booking.time === t ? ' selected' : '')}
                          onClick={() => updateBooking({ time: t })}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {currentStepName === 'confirm' && (
            <div className="client-booking-step client-booking-confirm">
              <div className="confirm-row">
                <span>Pet:</span>
                <strong>{booking.pet?.name || pets.find((p) => p.id === booking.petId)?.name || '-'}</strong>
              </div>
              <div className="confirm-row">
                <span>Serviço:</span>
                <strong>{SERVICOS.find((s) => s.value === booking.service)?.label || booking.service}</strong>
              </div>
              <div className="confirm-row">
                <span>Data:</span>
                <strong>
                  {booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                </strong>
              </div>
              <div className="confirm-row">
                <span>Horário:</span>
                <strong>{booking.time || '-'}</strong>
              </div>
              <div className="form-group-booking">
                <label>Observações (opcional)</label>
                <textarea
                  value={booking.notes}
                  onChange={(e) => updateBooking({ notes: e.target.value })}
                  rows={2}
                  placeholder="Alguma informação importante?"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="form-error-booking">{error}</div>}

      {pets.length > 0 && (
        <div className="client-booking-actions">
          {step > 0 ? (
            <button type="button" className="btn-prev-booking" onClick={prevStep}>
              Voltar
            </button>
          ) : (
            <Link to="/cliente/agendamentos" className="btn-prev-booking">
              Cancelar
            </Link>
          )}
          {step < 3 ? (
            <button
              type="button"
              className="btn-next-booking"
              onClick={nextStep}
              disabled={
                (currentStepName === 'pet' && !booking.petId) ||
                (currentStepName === 'datetime' && (!booking.date || !booking.time))
              }
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              className="btn-next-booking btn-confirm-booking"
              onClick={handleConfirm}
              disabled={createMutation.isPending || !booking.petId || !booking.date || !booking.time}
            >
              {createMutation.isPending ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
