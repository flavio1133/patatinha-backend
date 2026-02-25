import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, petsAPI } from '../services/api';
import './ClientAppointmentsPage.css';

const SERVICE_LABEL = {
  banho: 'Banho',
  tosa: 'Tosa',
  banho_tosa: 'Banho e Tosa',
  veterinario: 'Consulta',
  hotel: 'Hotel',
  outros: 'Outros',
};

const STATUS_LABEL = {
  confirmed: 'Confirmado',
  checked_in: 'Check-in',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function ClientAppointmentsPage() {
  const queryClient = useQueryClient();
  const [cancelandoId, setCancelandoId] = useState(null);

  const { data: appointmentsData } = useQuery({
    queryKey: ['cliente-appointments'],
    queryFn: () => appointmentsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => appointmentsAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-appointments'] });
      setCancelandoId(null);
    },
    onError: () => setCancelandoId(null),
  });

  const pets = petsData?.pets || [];
  const appointments = appointmentsData?.appointments || [];
  const petsMap = useMemo(() => {
    const m = {};
    pets.forEach((p) => (m[p.id] = p));
    return m;
  }, [pets]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== 'cancelled' && a.date >= today)
        .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
        .map((a) => ({
          ...a,
          petName: petsMap[a.petId]?.name || 'Pet',
          serviceLabel: SERVICE_LABEL[a.service] || a.service,
          statusLabel: STATUS_LABEL[a.status] || a.status,
          professionalName: a.professionalName || 'A definir',
        })),
    [appointments, petsMap, today]
  );

  const past = useMemo(
    () =>
      appointments
        .filter((a) => a.date < today || a.status === 'cancelled')
        .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')))
        .slice(0, 20)
        .map((a) => ({
          ...a,
          petName: petsMap[a.petId]?.name || 'Pet',
          serviceLabel: SERVICE_LABEL[a.service] || a.service,
          statusLabel: STATUS_LABEL[a.status] || a.status,
          professionalName: a.professionalName || 'A definir',
        })),
    [appointments, petsMap, today]
  );

  const handleCancel = (id) => {
    if (window.confirm('Deseja realmente cancelar este agendamento?')) {
      setCancelandoId(id);
      cancelMutation.mutate(id);
    }
  };

  return (
    <div className="cliente-page client-appointments-page">
      <header className="cliente-page-header">
        <h1>Meus agendamentos</h1>
        <p className="cliente-sub">Visualize e gerencie seus agendamentos.</p>
      </header>

      <Link to="/cliente/agendar" className="client-appointments-btn-new">
        Agendar novo serviço
      </Link>

      {upcoming.length > 0 && (
        <section className="client-appointments-section">
          <h2>Próximos</h2>
          <ul className="client-appointments-list">
            {upcoming.map((a) => (
              <li key={a.id} className="client-appointments-item upcoming">
                <div className="appointment-info">
                  <span className="appointment-datetime appointment-time-block">
                    {a.date === today ? 'Hoje' : new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR')} às <strong>{a.time}</strong>
                  </span>
                  <span className="appointment-pet">{a.petName}</span>
                  <span className="appointment-service">{a.serviceLabel}</span>
                  <span className="appointment-professional">👤 {a.professionalName}</span>
                  <span className={'appointment-status status-' + a.status}>{a.statusLabel}</span>
                </div>
                <button
                  type="button"
                  className="btn-cancel-appointment"
                  disabled={cancelandoId === a.id}
                  onClick={() => handleCancel(a.id)}
                >
                  {cancelandoId === a.id ? 'Cancelando...' : 'Cancelar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length === 0 && (
        <div className="client-appointments-empty">
          <p>Nenhum agendamento futuro.</p>
          <Link to="/cliente/agendar">Agendar serviço</Link>
        </div>
      )}

      {past.length > 0 && (
        <section className="client-appointments-section">
          <h2>Histórico</h2>
          <ul className="client-appointments-list client-appointments-list-past">
            {past.map((a) => (
              <li
                key={a.id}
                className={'client-appointments-item past' + (a.status === 'cancelled' ? ' cancelled' : '')}
              >
                <span className="appointment-datetime">
                  {new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR')} <strong>{a.time}</strong>
                </span>
                <span className="appointment-pet">{a.petName}</span>
                <span className="appointment-service">{a.serviceLabel}</span>
                <span className="appointment-professional">👤 {a.professionalName}</span>
                <span className={'appointment-status status-' + a.status}>{a.statusLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
