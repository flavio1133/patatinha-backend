import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI, customersAPI } from '../services/api';
import './AdminPetsPage.css';

export default function AdminPetsPage() {
  const [search, setSearch] = useState('');

  const { data: petsRes, isLoading } = useQuery({
    queryKey: ['admin-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const { data: customersRes } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const pets = petsRes?.pets || [];
  const customers = customersRes?.customers || [];
  const customerMap = useMemo(() => {
    const m = {};
    customers.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [customers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return pets;
    const s = search.trim().toLowerCase();
    return pets.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(s)) ||
        (p.breed && p.breed.toLowerCase().includes(s)) ||
        (p.species && p.species.toLowerCase().includes(s)) ||
        (customerMap[p.customerId] && customerMap[p.customerId].toLowerCase().includes(s))
    );
  }, [pets, search, customerMap]);

  return (
    <div className="admin-pets-page">
      <div className="admin-pets-header">
        <h1>Pets</h1>
        <p className="admin-pets-sub">Lista de pets cadastrados.</p>
        <div className="admin-pets-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nome, raca, especie ou dono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading && !petsRes ? (
        <div className="admin-pets-loading">Carregando...</div>
      ) : (
        <div className="admin-pets-table-wrapper">
          <table className="admin-pets-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especie</th>
                <th>Raca</th>
                <th>Idade</th>
                <th>Dono</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-pets-empty">
                    Nenhum pet encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((pet) => (
                  <tr key={pet.id}>
                    <td>
                      <span className="pet-name">{pet.name}</span>
                    </td>
                    <td>{pet.species || '-'}</td>
                    <td>{pet.breed || '-'}</td>
                    <td>{pet.age != null ? pet.age + ' ano(s)' : '-'}</td>
                    <td>{pet.ownerName || customerMap[pet.customerId] || '-'}</td>
                    <td>
                      <Link to={`/gestao/pets/${pet.id}`} className="btn-admin-view">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}