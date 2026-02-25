import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBooking } from '../contexts/BookingContext';
import { useCompany } from '../contexts/CompanyContext';
import { appointmentsAPI, petsAPI, companiesAPI, invitationCodesAPI } from '../services/api';
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
  const { companyId: contextCompanyId, setCompanyId: setContextCompanyId } = useCompany();
  const { step, currentStepName, booking, updateBooking, nextStep, prevStep, goToStep, reset } = useBooking();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const calendarDays = useMemo(() => getDaysNext(30), []);

  const storedCompanyId = typeof window !== 'undefined'
    ? window.localStorage.getItem('client_company_id')
    : null;

  const { data: linkedData } = useQuery({
    queryKey: ['linked-companies'],
    queryFn: () => invitationCodesAPI.getLinkedCompanies(),
    retry: false,
  });
  const linkedCompanies = linkedData?.companies || [];
  const effectiveCompanyId = booking.companyId || contextCompanyId || storedCompanyId || undefined;

  useEffect(() => {
    if (linkedCompanies.length === 1 && !booking.companyId) {
      updateBooking({ companyId: linkedCompanies[0].id, company: linkedCompanies[0] });
      goToStep(1);
    }
  }, [linkedCompanies, booking.companyId, updateBooking, goToStep]);

  // Fallback: se a API de empresas vinculadas ainda não retornou nada,
  // mas existe companyId salvo em localStorage (client_company_id),
  // considerar o cliente como vinculado para permitir o agendamento.
  useEffect(() => {
    if (!booking.companyId && !linkedCompanies.length && storedCompanyId) {
      updateBooking({ companyId: storedCompanyId });
      goToStep(1);
    }
  }, [booking.companyId, linkedCompanies.length, storedCompanyId, updateBooking, goToStep]);

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const { data: companyPublicData } = useQuery({
    queryKey: ['company-public', effectiveCompanyId],
    queryFn: () => companiesAPI.getPublic(effectiveCompanyId).then((r) => r.data),
    enabled: !!effectiveCompanyId,
    retry: false,
  });
  const servicesOffered = companyPublicData?.services_offered || [];
  const serviceOptions = useMemo(() => {
    const all = SERVICOS;
    if (servicesOffered.length === 0) return all;
    return all.filter((s) => servicesOffered.includes(s.value));
  }, [servicesOffered]);

  const { data: professionalsData } = useQuery({
    queryKey: ['company-professionals', effectiveCompanyId],
    queryFn: () => companiesAPI.getProfessionals(effectiveCompanyId),
    enabled: !!effectiveCompanyId,
    retry: false,
  });
  const companyProfessionals = professionalsData?.professionals || [];

  const getAvailabilityFn = (d, s) =>
    effectiveCompanyId
      ? companiesAPI.getAvailability(effectiveCompanyId, d, s).then((res) => res.data)
      : appointmentsAPI.getAvailability(d, s).then((res) => res.data);

  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ['availability', effectiveCompanyId, booking.date, booking.service],
    queryFn: () => getAvailabilityFn(booking.date, booking.service),
    enabled: !!effectiveCompanyId && !!booking.date && !!booking.service,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body) => appointmentsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-appointments'] });
      if (booking.companyId) setContextCompanyId(booking.companyId);
      reset();
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/cliente/agendamentos'), 2000);
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao agendar. Tente outro horário.'),
  });

  const pets = petsData?.pets || [];
  const availability = availabilityData?.availability || [];
  const availabilityFiltered = useMemo(() => {
    if (!booking.professionalId) return availability;
    return availability.filter((a) => String(a.professionalId) === String(booking.professionalId));
  }, [availability, booking.professionalId]);
  const allSlots = useMemo(() => {
    const set = new Set();
    availabilityFiltered.forEach((a) => (a.availableSlots || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [availabilityFiltered]);
  const professionalOptions = useMemo(() => {
    const fromAvailability = availability.map((a) => ({ id: a.professionalId, name: a.professionalName }));
    if (fromAvailability.length > 0) return fromAvailability;
    return companyProfessionals.map((p) => ({ id: p.id, name: p.name }));
  }, [availability, companyProfessionals]);

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
      companyId: effectiveCompanyId || undefined,
      professionalId: booking.professionalId ? parseInt(booking.professionalId, 10) : undefined,
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

  const stepLabels = ['Pet Shop', 'Pet', 'Serviço', 'Data e Horário', 'Confirmar'];
  const progress = ((step + 1) / 5) * 100;

  const needUnitStep = linkedCompanies.length > 1;
  const hasNoCompany = linkedCompanies.length === 0 && !booking.companyId && !storedCompanyId;
  const canProceedWithoutPets = currentStepName === 'unit';

  return (
    <div className="client-booking-flow">
      <header className="client-booking-header">
        <h1>Agendar serviço</h1>
        <div className="client-booking-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="client-booking-step-label">Etapa {step + 1} de 5: {stepLabels[step]}</p>
      </header>

      {hasNoCompany ? (
        <div className="cliente-card agendar-empty">
          <p>Você ainda não está vinculado a nenhum Pet Shop.</p>
          <Link to="/cliente/codigo">Vincular Pet Shop</Link> com um código de acesso e depois volte para agendar.
        </div>
      ) : pets.length === 0 && !canProceedWithoutPets ? (
        <div className="cliente-card agendar-empty">
          <p>Você ainda não tem pets cadastrados.</p>
          <Link to="/cliente/pets/novo">Cadastrar pet</Link> e depois volte para agendar.
        </div>
      ) : (
        <div className="client-booking-steps">
          {currentStepName === 'unit' && (
            <div className="client-booking-step">
              <label>Selecione o Pet Shop *</label>
              <div className="unit-select-grid">
                {linkedCompanies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={'unit-select-btn' + (booking.companyId === c.id ? ' selected' : '')}
                    onClick={() => updateBooking({ companyId: c.id, company: c, service: 'banho_tosa', date: '', time: '' })}
                  >
                    <span className="unit-name">{c.name}</span>
                    {c.phone && <span className="unit-meta">{c.phone}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              {booking.company && (
                <div className="booking-step-company">
                  <label>Pet Shop vinculado</label>
                  <p className="booking-company-name">{booking.company.name}</p>
                </div>
              )}
              {companyProfessionals.length > 0 && (
                <div className="form-group-booking">
                  <label>Profissional *</label>
                  <select
                    value={booking.professionalId || ''}
                    onChange={(e) => updateBooking({ professionalId: e.target.value || null, date: '', time: '' })}
                    className="service-select"
                  >
                    <option value="">Selecione o profissional</option>
                    {companyProfessionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <label>Selecione o serviço *</label>
              <select
                value={serviceOptions.some((s) => s.value === booking.service) ? booking.service : (serviceOptions[0]?.value || 'banho_tosa')}
                onChange={(e) => updateBooking({ service: e.target.value, date: '', time: '' })}
                className="service-select"
              >
                {(serviceOptions.length ? serviceOptions : SERVICOS).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {currentStepName === 'datetime' && (
            <div className="client-booking-step">
              {booking.professionalId && professionalOptions.length > 0 && (
                <div className="booking-step-company">
                  <label>Profissional</label>
                  <p className="booking-company-name">
                    {professionalOptions.find((p) => String(p.id) === String(booking.professionalId))?.name || '—'}
                  </p>
                </div>
              )}
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
                  {professionalOptions.length > 1 && (
                    <div className="form-group-booking">
                      <label>Alterar profissional (opcional)</label>
                      <select
                        value={booking.professionalId || ''}
                        onChange={(e) => updateBooking({ professionalId: e.target.value || null, time: '' })}
                        className="service-select"
                      >
                        <option value="">Qualquer disponível</option>
                        {professionalOptions.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
              {booking.company && (
                <div className="confirm-row">
                  <span>Pet Shop:</span>
                  <strong>{booking.company.name}</strong>
                </div>
              )}
              <div className="confirm-row">
                <span>Pet:</span>
                <strong>{booking.pet?.name || pets.find((p) => p.id === booking.petId)?.name || '-'}</strong>
              </div>
              <div className="confirm-row">
                <span>Serviço:</span>
                <strong>{(serviceOptions.length ? serviceOptions : SERVICOS).find((s) => s.value === booking.service)?.label || booking.service}</strong>
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

      {(linkedCompanies.length > 0 || booking.companyId) && (pets.length > 0 || currentStepName === 'unit') && (
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
          {step < 4 ? (
            <button
              type="button"
              className="btn-next-booking"
              onClick={nextStep}
              disabled={
                (currentStepName === 'unit' && !booking.companyId) ||
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
