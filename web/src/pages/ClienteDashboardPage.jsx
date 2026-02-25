import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { appointmentsAPI, petsAPI } from '../services/api';
import { useCompany } from '../contexts/CompanyContext';
import { mockCliente } from '../data/mockData';
import './ClienteDashboardPage.css';

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
  checked_in: 'Check-in realizado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export default function ClienteDashboardPage() {
  const { user } = useAuth();
  const { company } = useCompany();
  const location = useLocation();
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const firstName = user?.name?.split(' ')[0] || 'Cliente';

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

  const apiAppointments = appointmentsData?.appointments || [];
  const apiPets = petsData?.pets || [];
  const petsMap = useMemo(() => {
    const m = {};
    apiPets.forEach((p) => { m[p.id] = p; });
    return m;
  }, [apiPets]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = useMemo(() => {
    return apiAppointments
      .filter((a) => a.status !== 'cancelled' && a.date >= today)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
      .map((a) => {
        const pet = petsMap[a.petId];
        const dateLabel = a.date === today ? 'Hoje' : new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return {
          id: a.id,
          petName: pet?.name || 'Pet',
          service: SERVICE_LABEL[a.service] || a.service,
          date: dateLabel,
          dateRaw: a.date,
          time: a.time || null,
          status: STATUS_LABEL[a.status] || a.status,
        };
      });
  }, [apiAppointments, petsMap, today]);

  const nextAppointment = upcomingAppointments[0] || null;

  const todayAppointments = useMemo(() => {
    return apiAppointments
      .filter((a) => a.date === today && a.status !== 'cancelled')
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      .map((a) => ({
        id: a.id,
        petName: petsMap[a.petId]?.name || 'Pet',
        service: SERVICE_LABEL[a.service] || a.service,
        time: a.time,
        status: a.status,
        statusLabel: STATUS_LABEL[a.status] || a.status,
      }));
  }, [apiAppointments, petsMap, today]);

  const historyItems = useMemo(() => {
    return apiAppointments
      .filter((a) => a.status === 'completed' || a.date < today)
      .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        date: new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR'),
        service: SERVICE_LABEL[a.service] || a.service,
        pet: petsMap[a.petId]?.name || '-',
        value: '-',
      }));
  }, [apiAppointments, petsMap, today]);

  const pets = apiPets.length > 0 ? apiPets : (mockCliente.pets || []);
  const history = historyItems.length > 0 ? historyItems : (mockCliente.history || []);
  const gallery = mockCliente.gallery || [];
  const nextImg = () => gallery.length && setGaleriaIndex((i) => (i + 1) % gallery.length);
  const prevImg = () => gallery.length && setGaleriaIndex((i) => (i - 1 + gallery.length) % gallery.length);

  return (
    <div className="cliente-dashboard">
      {location.state?.message && <p className="welcome-msg">{location.state.message}</p>}
      <header className="cliente-dashboard-header">
        <h1 className="cliente-dashboard-title">
          Olá, {firstName}! {company ? <span className="cliente-dashboard-company">🐾 {company.name}</span> : '🐾'}
        </h1>
        <p className="cliente-dashboard-sub">
          Aqui você acompanha seus pets e agendamentos.
        </p>
      </header>

      {!nextAppointment && upcomingAppointments.length === 0 && (
        <section className="card proximo-agendamento empty">
          <h2>Próximo agendamento</h2>
          <p>Nenhum agendamento futuro</p>
          <Link to="/cliente/agendar" className="ui-btn ui-btn-primary btn-agendar-now">
            Agendar agora
          </Link>
        </section>
      )}

      {nextAppointment && (
        <section className="card proximo-agendamento">
          <h2>Próximo agendamento</h2>
          <div className="agendamento-content">
          <div className="agendamento-pet">{nextAppointment.petName}</div>
          <div className="agendamento-service">{nextAppointment.service}</div>
          <div className="agendamento-datetime">
            {nextAppointment.time
              ? `${nextAppointment.date} às ${nextAppointment.time}`
              : nextAppointment.date}
          </div>
            <span className="agendamento-status">{nextAppointment.status}</span>
          </div>
          <Link to="/cliente/agendamentos" className="ui-btn ui-btn-primary btn-ver-detalhes">
            Ver detalhes
          </Link>
        </section>
      )}

      {todayAppointments.length > 0 && (
        <section className="card acompanhamento-tempo-real">
          <h2>Acompanhamento de hoje</h2>
          <p className="cliente-dashboard-hint">
            Acompanhe em tempo real: check-in, em andamento ou concluído.
          </p>
          <ul className="today-list">
            {todayAppointments.map((a) => (
              <li key={a.id} className={'today-item status-' + (a.status || '')}>
                <span className="today-time">{a.time || '--:--'}</span>
                <span className="today-pet">{a.petName}</span>
                <span className="today-service">{a.service}</span>
                <span className="today-status">{a.statusLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card meus-pets">
        <h2>🐾 Meus pets ({pets.length})</h2>
        <div className="pets-grid">
          {pets.map((pet) => (
            <Link key={pet.id} to={`/cliente/pets/${pet.id}`} className="pet-card">
              <div
                className="pet-foto pet-foto-placeholder"
              >
                {(pet.species || '').toLowerCase() === 'cat' ? '🐈' : '🐕'}
              </div>
              <div className="pet-info">
                <strong>{pet.name}</strong>
                <span>{pet.breed || pet.species || '-'}</span>
              </div>
              <span className="pet-card-ver">Ver perfil</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card historico">
        <div className="cliente-dashboard-section-header">
          <h2>📋 Últimos serviços</h2>
          <Link to="/cliente/historico" className="cliente-dashboard-link">
            Ver histórico completo
          </Link>
        </div>
        <ul className="historico-list">
          {history.map((item) => (
            <li key={item.id} className="historico-item">
              <span className="historico-date">{item.date}</span>
              <span className="historico-service">{item.service}</span>
              <span className="historico-pet">{item.pet}</span>
              <span className="historico-value">{typeof item.value === 'number' ? 'R$ ' + item.value.toFixed(2) : item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {gallery.length > 0 && (
        <section className="card galeria">
          <div className="cliente-dashboard-section-header">
            <h2>📷 Memórias recentes</h2>
            <Link to="/cliente/galeria" className="cliente-dashboard-link">
              Ver galeria
            </Link>
          </div>
          <div className="galeria-wrap">
            <button type="button" className="galeria-btn prev" onClick={prevImg} aria-label="Anterior">
              ‹
            </button>
            <div className="galeria-img-wrap">
              <img src={gallery[galeriaIndex].url} alt={gallery[galeriaIndex].caption} className="galeria-img" />
              <p className="galeria-caption">{gallery[galeriaIndex].caption}</p>
            </div>
            <button type="button" className="galeria-btn next" onClick={nextImg} aria-label="Próxima">
              ›
            </button>
          </div>
          <div className="galeria-dots">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                className={'dot ' + (i === galeriaIndex ? 'active' : '')}
                onClick={() => setGaleriaIndex(i)}
                aria-label={'Foto ' + (i + 1)}
              />
            ))}
          </div>
        </section>
      )}

      <Link to="/cliente/agendar" className="cliente-dashboard-fab">
        Agendar novo serviço
      </Link>
    </div>
  );
}
