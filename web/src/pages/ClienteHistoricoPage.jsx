import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsAPI, petsAPI } from '../services/api';
import './ClienteHistoricoPage.css';

const SERVICE_LABEL = { banho: 'Banho', tosa: 'Tosa', banho_tosa: 'Banho e Tosa', veterinario: 'Consulta', hotel: 'Hotel', outros: 'Outros' };
const STATUS_LABEL = { confirmed: 'Confirmado', checked_in: 'Check-in', in_progress: 'Em andamento', completed: 'Concluido', cancelled: 'Cancelado' };

export default function ClienteHistoricoPage() {
  const [filterPet, setFilterPet] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

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

  const pets = petsData?.pets || [];
  const appointments = appointmentsData?.appointments || [];
  const petsMap = useMemo(() => {
    const m = {};
    pets.forEach((p) => { m[p.id] = p; });
    return m;
  }, [pets]);

  const filtered = useMemo(() => {
    let list = [...appointments].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    if (filterPet) list = list.filter((a) => a.petId === parseInt(filterPet, 10));
    if (filterStatus) list = list.filter((a) => a.status === filterStatus);
    if (filterDateFrom) list = list.filter((a) => a.date >= filterDateFrom);
    if (filterDateTo) list = list.filter((a) => a.date <= filterDateTo);
    return list;
  }, [appointments, filterPet, filterStatus, filterDateFrom, filterDateTo]);

  return (
    <div className="cliente-page cliente-historico-page">
      <header className="cliente-page-header">
        <h1>Historico de agendamentos</h1>
        <p className="cliente-sub">Filtre por pet, status ou periodo.</p>
      </header>
      <div className="cliente-card filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <label>Pet</label>
            <select value={filterPet} onChange={(e) => setFilterPet(e.target.value)}>
              <option value="">Todos</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="confirmed">Confirmado</option>
              <option value="checked_in">Check-in</option>
              <option value="in_progress">Em andamento</option>
              <option value="completed">Concluido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Data de</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Data ate</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="cliente-card historico-list-card">
        {filtered.length === 0 ? (
          <p className="empty-text">Nenhum agendamento encontrado.</p>
        ) : (
          <ul className="historico-list-full">
            {filtered.map((a) => (
              <li key={a.id} className={'historico-row ' + (a.status === 'cancelled' ? 'cancelled' : '')}>
                <span className="col-date">{new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                <span className="col-time">{a.time}</span>
                <span className="col-pet">{petsMap[a.petId]?.name || '-'}</span>
                <span className="col-service">{SERVICE_LABEL[a.service] || a.service}</span>
                <span className="col-status">{STATUS_LABEL[a.status] || a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
