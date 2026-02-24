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
    mutationFn: ({ id, reason }) => petsAPI.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-pets'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.message;
      if (err.response?.status === 403) {
        alert('Apenas o gestor da pet shop pode desativar um pet. Entre em contato com a loja.');
      } else {
        alert(msg || 'Não foi possível desativar.');
      }
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
                    const reason = window.prompt('Motivo da desativação (obrigatório):');
                    if (reason != null && reason.trim()) {
                      deleteMutation.mutate({ id: pet.id, reason: reason.trim() });
                    } else if (reason !== null) {
                      alert('Informe o motivo para desativar.');
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Desativar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
