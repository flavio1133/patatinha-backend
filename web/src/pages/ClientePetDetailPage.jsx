import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI } from '../services/api';
import './ClientePetDetailPage.css';

const SERVICE_LABEL = { banho: 'Banho', tosa: 'Tosa', banho_tosa: 'Banho e Tosa', veterinario: 'Consulta', hotel: 'Hotel', outros: 'Outros' };
const STATUS_LABEL = { confirmed: 'Confirmado', checked_in: 'Check-in', in_progress: 'Em andamento', completed: 'Concluido', cancelled: 'Cancelado' };

export default function ClientePetDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['pet-history', id],
    queryFn: () => petsAPI.getHistory(id).then((res) => res.data),
    enabled: !!id,
    retry: false,
  });

  if (isLoading || !data) {
    return <div className="cliente-page"><div className="cliente-loading">Carregando...</div></div>;
  }
  if (error) {
    return (
      <div className="cliente-page">
        <div className="cliente-card"><p>Pet nao encontrado.</p><Link to="/cliente/pets">Voltar aos pets</Link></div>
      </div>
    );
  }

  const { pet, appointments, photos } = data;

  return (
    <div className="cliente-page cliente-pet-detail-page">
      <header className="cliente-page-header">
        <Link to="/cliente/pets" className="back-link">Voltar aos pets</Link>
        <div className="pet-detail-title">
          <span className="pet-detail-avatar">{(pet.species || 'dog').toLowerCase() === 'cat' ? '🐈' : '🐕'}</span>
          <div>
            <h1>{pet.name}</h1>
            <Link to={`/cliente/pets/${id}/editar`} className="link-edit-pet">Editar pet</Link>
          </div>
        </div>
      </header>

      <section className="cliente-card section-history">
        <h2>Historico de servicos</h2>
        {appointments.length === 0 ? (
          <p className="empty-text">Nenhum servico registrado ainda.</p>
        ) : (
          <ul className="history-list">
            {appointments.map((a) => (
              <li key={a.id} className={'history-item ' + (a.status === 'cancelled' ? 'cancelled' : '')}>
                <span className="history-date">{new Date(a.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                <span className="history-time">{a.time}</span>
                <span className="history-service">{SERVICE_LABEL[a.service] || a.service}</span>
                <span className="history-status">{STATUS_LABEL[a.status] || a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cliente-card section-gallery">
        <h2>Galeria de fotos</h2>
        {photos.length === 0 ? (
          <p className="empty-text">Nenhuma foto ainda. As fotos dos servicos aparecerao aqui.</p>
        ) : (
          <div className="gallery-grid">
            {photos.map((ph) => (
              <div key={ph.id} className="gallery-item">
                <img src={ph.imageUrl} alt={ph.caption || 'Foto'} />
                {ph.caption && <p className="gallery-caption">{ph.caption}</p>}
                {ph.serviceDate && <span className="gallery-date">{new Date(ph.serviceDate).toLocaleDateString('pt-BR')}</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
