import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { petsAPI, customersAPI } from '../services/api';
import './AdminPetDetailPage.css';

export default function AdminPetDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pet', id],
    queryFn: () => petsAPI.getById(id).then((r) => r.data),
    enabled: !!id,
  });
  const pet = data?.pet || data;

  const { data: customerData } = useQuery({
    queryKey: ['customer', pet?.customerId],
    queryFn: () => customersAPI.getById(pet.customerId).then((r) => r.data),
    enabled: !!pet?.customerId,
  });
  const customer = customerData?.customer ?? customerData;
  const ownerName = customer?.name || pet?.ownerName || pet?.customerName || '-';

  if (isLoading && !data) return <div className="loading">Carregando...</div>;
  if (!pet) return (
    <div className="admin-pet-detail"><p>Pet não encontrado.</p><Link to="/gestao/pets">Voltar</Link></div>
  );

  const alerts = [].concat(
    pet.importantInfo ? [{ type: 'info', text: pet.importantInfo }] : [],
    (pet.behaviorAlerts || []).map((t) => ({ type: 'behavior', text: t }))
  );

  return (
    <div className="admin-pet-detail">
      <Link to="/gestao/pets" className="back-link">← Voltar para Pets</Link>
      <div className="pet-header">
        <div className="pet-photo-large">{pet.photo ? <img src={pet.photo} alt={pet.name} /> : <span>🐶</span>}</div>
        <div className="pet-info">
          <h1>{pet.name}</h1>
          <p>{pet.species || '-'} • {pet.breed || 'SRD'}</p>
          <p>Dono: {ownerName}</p>
          {(pet.age != null || pet.weight != null) && (
            <p>{pet.age != null && `${pet.age} ano(s)`}{pet.weight != null && ` • ${pet.weight} kg`}</p>
          )}
        </div>
      </div>
      {alerts.length > 0 && (
        <div className="pet-alerts">
          {alerts.map((a, i) => (
            <div key={i} className={`alert-box ${a.type === 'info' ? 'important' : 'behavior'}`}>
              {a.type === 'info' ? '⚠️ Info importante: ' : '🐾 '}{a.text}
            </div>
          ))}
        </div>
      )}
      {pet.groomingPreferences && (pet.groomingPreferences.notes || pet.groomingPreferences.hairLength || pet.groomingPreferences.shampooType) && (
        <div className="pet-grooming">
          <h3>Preferências de tosa/banho</h3>
          <ul>
            {pet.groomingPreferences.hairLength && <li>Comprimento dos pelos: {pet.groomingPreferences.hairLength}</li>}
            {pet.groomingPreferences.shampooType && <li>Shampoo: {pet.groomingPreferences.shampooType}</li>}
            {pet.groomingPreferences.notes && <li>{pet.groomingPreferences.notes}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
