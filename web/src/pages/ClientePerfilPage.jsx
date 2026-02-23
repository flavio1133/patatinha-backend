import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { useMutation } from '@tanstack/react-query';
import './ClientePerfilPage.css';

export default function ClientePerfilPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => {
      const u = res.data?.user;
      if (u && typeof refreshUser === 'function') refreshUser();
      setSuccess('Perfil atualizado.');
      setCurrentPassword('');
      setNewPassword('');
      setError('');
    },
    onError: (err) => setError(err.response?.data?.error || 'Erro ao atualizar.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const data = { name: name.trim(), phone: phone.trim() || undefined };
    if (newPassword) {
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }
    updateMutation.mutate(data);
  };

  return (
    <div className="cliente-page cliente-perfil-page">
      <header className="cliente-page-header">
        <h1>Meu perfil</h1>
        <p className="cliente-sub">Atualize seus dados e senha.</p>
      </header>
      <div className="cliente-card form-card-perfil">
        <form onSubmit={handleSubmit} className="form-perfil">
          <div className="form-group">
            <label>Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={user?.email || ''} disabled className="input-disabled" />
            <span className="hint">O e-mail nao pode ser alterado.</span>
          </div>
          <div className="form-group">
            <label>Telefone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <hr className="form-divider" />
          <h3>Alterar senha (opcional)</h3>
          <div className="form-group">
            <label>Senha atual</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Deixe em branco para nao alterar" />
          </div>
          <div className="form-group">
            <label>Nova senha</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimo 6 caracteres" minLength={6} />
          </div>
          {success && <p className="form-success">{success}</p>}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-submit-perfil" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar alteracoes'}
          </button>
        </form>
      </div>
    </div>
  );
}
