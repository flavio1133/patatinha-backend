import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsAPI, photosAPI } from '../services/api';
import './ClienteGaleriaPage.css';

export default function ClienteGaleriaPage() {
  const queryClient = useQueryClient();
  const [selectedPetId, setSelectedPetId] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addError, setAddError] = useState('');

  const { data: petsData } = useQuery({
    queryKey: ['cliente-pets'],
    queryFn: () => petsAPI.getAll().then((res) => res.data),
    retry: false,
  });
  const { data: photosData } = useQuery({
    queryKey: ['photos-pet', selectedPetId],
    queryFn: () => photosAPI.getByPet(selectedPetId).then((res) => res.data),
    enabled: !!selectedPetId,
    retry: false,
  });

  const createPhotoMutation = useMutation({
    mutationFn: (body) => photosAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos-pet', selectedPetId] });
      setAddUrl('');
      setAddError('');
    },
    onError: (err) => setAddError(err.response?.data?.error || 'Erro ao adicionar.'),
  });

  const pets = petsData?.pets || [];
  const photos = photosData?.photos || [];

  const handleAddPhoto = (e) => {
    e.preventDefault();
    setAddError('');
    if (!selectedPetId) {
      setAddError('Selecione um pet.');
      return;
    }
    const url = addUrl.trim();
    if (!url) {
      setAddError('Informe a URL da foto. Cole o endereço completo da imagem (ex: https://exemplo.com/foto.jpg).');
      return;
    }
    createPhotoMutation.mutate({
      petId: parseInt(selectedPetId, 10),
      type: 'general',
      imageUrl: url,
    });
  };

  return (
    <div className="cliente-page cliente-galeria-page">
      <header className="cliente-page-header">
        <h1>Galeria de fotos</h1>
        <p className="cliente-sub">Selecione um pet para ver e adicionar fotos.</p>
      </header>
      <div className="cliente-card galeria-select-card">
        <label>Pet</label>
        <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)}>
          <option value="">Selecione um pet</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      {selectedPetId && (
        <>
          <div className="cliente-card add-photo-card">
            <h2>Adicionar foto (URL)</h2>
            <form onSubmit={handleAddPhoto} className="form-add-photo">
              <input
                type="url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                title="Cole aqui o link completo da imagem"
              />
              <p className="form-hint">Cole a URL completa da imagem (o texto em cinza é só um exemplo).</p>
              <button type="submit" className="btn-add-photo" disabled={createPhotoMutation.isPending}>
                {createPhotoMutation.isPending ? 'Adicionando...' : 'Adicionar'}
              </button>
            </form>
            {addError && <p className="form-error">{addError}</p>}
          </div>
          <div className="cliente-card gallery-card">
            <h2>Fotos</h2>
            {photos.length === 0 ? (
              <p className="empty-text">Nenhuma foto. Adicione uma URL acima.</p>
            ) : (
              <div className="galeria-grid-page">
                {photos.map((ph) => (
                  <div key={ph.id} className="galeria-item-page">
                    <img src={ph.imageUrl} alt={ph.caption || 'Foto'} />
                    {ph.caption && <p>{ph.caption}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
