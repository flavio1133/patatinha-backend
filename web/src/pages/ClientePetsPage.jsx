import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsAPI } from '../services/api';
import './ClientePetsPage.css';

export default function ClientePetsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => petsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-pets'] });
    },
  });

  const pets = data?.pets || [];

  return (
    <div className="cliente-page cliente-pets-page">
      <header className="cliente-page-header">
        <h1>🐾 Meus Pets</h1>
        <p className="cliente-sub">Cadastre e gerencie seus pets.</p>
        <Link to="/cliente/pets/novo" className="btn-primary-cliente">
          + Novo Pet
        </Link>
      </header>

      {isLoading && !data ? (
        <div className="cliente-loading">Carregando...</div>
      ) : pets.length === 0 ? (
        <div className="cliente-card cliente-empty-state">
          <p>Você ainda não tem pets cadastrados.</p>
          <Link to="/cliente/pets/novo" className="btn-primary-cliente">Cadastrar primeiro pet</Link>
        </div>
      ) : (
        <div className="pets-grid-cliente">
          {pets.map((pet) => (
            <div key={pet.id} className="pet-card-cliente">
              <Link to={`/cliente/pets/${pet.id}`} className="pet-card-link">
                <div
                  className="pet-card-avatar"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF9F6B 100%)',
                    color: 'white',
                    fontSize: '2.5rem',
                  }}
                >
                  {(pet.species || 'dog').toLowerCase() === 'cat' ? '🐈' : '🐕'}
                </div>
                <div className="pet-card-info">
                  <strong>{pet.name}</strong>
                  <span>{pet.breed || pet.species || '-'}</span>
                  {pet.age != null && <span>{pet.age} ano(s)</span>}
                </div>
              </Link>
              <div className="pet-card-actions">
                <Link to={`/cliente/pets/${pet.id}/editar`} className="btn-edit-pet">Editar</Link>
                <button
                  type="button"
                  className="btn-delete-pet"
                  onClick={() => {
                    if (window.confirm(`Remover ${pet.name}?`)) {
                      deleteMutation.mutate(pet.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
