import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsAPI } from '../services/api';
import './ClientePetFormPage.css';

const SPECIES = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Pássaro' },
  { value: 'rabbit', label: 'Coelho' },
  { value: 'other', label: 'Outro' },
];

export default function ClientePetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id && id !== 'novo');

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [importantInfo, setImportantInfo] = useState('');
  const [error, setError] = useState('');

  const { data: petData } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => petsAPI.getById(id).then((res) => res.data),
    enabled: isEdit,
    retry: false,
  });

  useEffect(() => {
    if (isEdit && petData) {
      setName(petData.name || '');
      setSpecies(petData.species || 'dog');
      setBreed(petData.breed || '');
      setAge(petData.age != null ? String(petData.age) : '');
      setBirthDate((petData.birthDate || '').toString().slice(0, 10));
      setImportantInfo(petData.importantInfo || '');
    }
  }, [isEdit, petData]);

  const createMutation = useMutation({
    mutationFn: (body) => petsAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-pets'] });
      navigate('/cliente/pets');
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao cadastrar.'),
  });

  const updateMutation = useMutation({
    mutationFn: (body) => petsAPI.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      navigate(`/cliente/pets/${id}`);
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao atualizar.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      importantInfo: importantInfo.trim() || undefined,
    };
    if (birthDate) payload.birthDate = birthDate;
    if (age !== '') payload.age = parseInt(age, 10);
    if (!payload.age && !payload.birthDate) {
      setError('Informe a idade ou a data de nascimento.');
      return;
    }
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="cliente-page cliente-pet-form-page">
      <header className="cliente-page-header">
        <Link to="/cliente/pets" className="back-link">Voltar aos pets</Link>
        <h1>{isEdit ? 'Editar pet' : 'Novo pet'}</h1>
      </header>

      <div className="cliente-card form-card-pet">
        <form onSubmit={handleSubmit} className="form-pet">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do pet"
              required
            />
          </div>
          <div className="form-group">
            <label>Especie *</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)} required>
              {SPECIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Raca</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ex.: Labrador, SRD"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Idade (anos)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex.: 2"
              />
            </div>
            <div className="form-group">
              <label>Data de nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Informacao importante (alergia, medicacao)</label>
            <textarea
              value={importantInfo}
              onChange={(e) => setImportantInfo(e.target.value)}
              rows={2}
              placeholder="Ex.: Alergico a xampu"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn-submit-pet" disabled={pending}>
              {pending ? 'Salvando...' : (isEdit ? 'Salvar' : 'Cadastrar pet')}
            </button>
            <Link to={isEdit ? `/cliente/pets/${id}` : '/cliente/pets'} className="btn-cancel-pet">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
