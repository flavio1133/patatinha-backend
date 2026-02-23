import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI, appointmentsAPI } from '../services/api';
import './ClientSearch.css';

const SERVICE_LABEL = {
  banho: 'Banho',
  tosa: 'Tosa',
  banho_tosa: 'Banho e Tosa',
  veterinario: 'Consulta',
  hotel: 'Hotel',
  outros: 'Outros',
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export default function ClientSearch({ expanded, onExpand, onCollapse }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
    retry: false,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['cliente-appointments'],
    queryFn: () => appointmentsAPI.getAll().then((r) => r.data),
    enabled: debouncedQuery.length >= 2,
    retry: false,
  });

  const pets = petsData?.pets || [];
  const appointments = appointmentsData?.appointments || [];

  const results = useCallback(() => {
    if (debouncedQuery.length < 2) return { pets: [], appointments: [], services: [] };
    const q = debouncedQuery.toLowerCase();
    const matchedPets = pets.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q) ||
        (p.species || '').toLowerCase().includes(q)
    );
    const serviceLabels = Object.entries(SERVICE_LABEL);
    const matchedServices = serviceLabels.filter(([, label]) => label.toLowerCase().includes(q));
    const matchedAppointments = appointments.filter((a) => {
      const pet = pets.find((p) => p.id === a.petId);
      const petName = pet?.name || '';
      const svc = SERVICE_LABEL[a.service] || a.service;
      const dateStr = a.date ? new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR') : '';
      return (
        petName.toLowerCase().includes(q) ||
        svc.toLowerCase().includes(q) ||
        dateStr.includes(q)
      );
    });
    return {
      pets: matchedPets,
      services: matchedServices.map(([value, label]) => ({ value, label })),
      appointments: matchedAppointments.slice(0, 5),
    };
  }, [debouncedQuery, pets, appointments]);

  const { pets: resPets, services: resServices, appointments: resAppointments } = results();
  const hasResults = resPets.length > 0 || resServices.length > 0 || resAppointments.length > 0;
  const showPanel = focused && (query.length >= 2 || debouncedQuery.length >= 2);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        onCollapse?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCollapse]);

  const handleSelect = (to) => {
    navigate(to);
    setQuery('');
    setFocused(false);
    onCollapse?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debouncedQuery.length >= 2 && (resPets.length > 0 || resAppointments.length > 0)) {
      if (resPets.length > 0) handleSelect(`/cliente/pets/${resPets[0].id}`);
      else if (resAppointments.length > 0) handleSelect('/cliente/agendamentos');
    }
  };

  return (
    <div ref={containerRef} className={'client-search' + (expanded ? ' expanded' : '')}>
      <form onSubmit={handleSubmit} className="client-search-form">
        <span className="client-search-icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            onExpand?.();
          }}
          placeholder="Buscar pets, serviços..."
          className="client-search-input"
          autoComplete="off"
          aria-label="Buscar"
        />
        {query && (
          <button
            type="button"
            className="client-search-clear"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Limpar"
          >
            ×
          </button>
        )}
      </form>

      {showPanel && (
        <div className="client-search-results">
          {debouncedQuery.length < 2 ? (
            <p className="client-search-hint">Digite ao menos 2 caracteres</p>
          ) : !hasResults ? (
            <p className="client-search-empty">Nenhum resultado encontrado</p>
          ) : (
            <>
              {resPets.length > 0 && (
                <div className="client-search-group">
                  <span className="client-search-group-title">Pets</span>
                  {resPets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      className="client-search-item"
                      onClick={() => handleSelect(`/cliente/pets/${pet.id}`)}
                    >
                      {pet.name} {pet.breed && ` - ${pet.breed}`}
                    </button>
                  ))}
                </div>
              )}
              {resServices.length > 0 && (
                <div className="client-search-group">
                  <span className="client-search-group-title">Serviços</span>
                  {resServices.map(({ value, label }) => (
                    <Link
                      key={value}
                      to="/cliente/agendar"
                      className="client-search-item"
                      onClick={() => onCollapse?.()}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
              {resAppointments.length > 0 && (
                <div className="client-search-group">
                  <span className="client-search-group-title">Agendamentos</span>
                  {resAppointments.map((a) => {
                    const pet = pets.find((p) => p.id === a.petId);
                    const dateLabel = a.date
                      ? new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR')
                      : '';
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className="client-search-item"
                        onClick={() => handleSelect('/cliente/agendamentos')}
                      >
                        {pet?.name || 'Pet'} - {SERVICE_LABEL[a.service] || a.service} - {dateLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
