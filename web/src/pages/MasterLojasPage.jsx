import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { masterAPI } from '../services/api';
import './AdminPetsPage.css';

const STATUS_LABEL = {
  active: 'Ativa',
  trial: 'Teste',
  canceled: 'Cancelada',
  past_due: 'Inadimplente',
  blocked: 'Bloqueada',
};

export default function MasterLojasPage() {
  const queryClient = useQueryClient();
  const [impersonating, setImpersonating] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-companies'],
    queryFn: () => masterAPI.getCompanies().then((res) => res.data),
    retry: 1,
  });

  const companies = data?.companies || [];

  const handleAcessarComoLoja = async (company) => {
    setImpersonating(company.id);
    try {
      const res = await masterAPI.impersonate(company.id);
      const { token, company: companyData, role } = res.data;
      localStorage.setItem('company_token', token);
      localStorage.setItem('company_id', companyData.id);
      localStorage.setItem('company_role', role || 'owner');
      localStorage.setItem('impersonating', '1');
      queryClient.clear();
      window.location.href = '/gestao/dashboard';
    } catch (err) {
      alert(err.response?.data?.error || 'Não foi possível acessar como loja.');
      setImpersonating(null);
    }
  };

  if (isLoading && !data) {
    return <div className="admin-pets-loading">Carregando lojas...</div>;
  }

  return (
    <div className="admin-pets-page">
      <div className="admin-pets-header">
        <div>
          <h1>Lojas / Clientes (Tenants)</h1>
          <p className="admin-pets-sub">Lista de todos os pet shops cadastrados na plataforma.</p>
        </div>
      </div>

      {isError && !data && (
        <div className="dashboard-api-error">
          <p>Não foi possível carregar a lista de lojas.</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>Tentar novamente</button>
        </div>
      )}

      <div className="admin-pets-table-wrapper">
        <table className="admin-pets-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-pets-empty">
                  Nenhuma loja cadastrada.
                </td>
              </tr>
            )}
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>{c.city || '—'}</td>
                <td>
                  <span className={`status-badge status-${c.subscription_status || 'trial'}`}>
                    {STATUS_LABEL[c.subscription_status] || c.subscription_status || 'Teste'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-admin-view"
                    onClick={() => handleAcessarComoLoja(c)}
                    disabled={impersonating != null}
                    title="Acessar como Loja (impersonation)"
                  >
                    {impersonating === c.id ? 'Entrando...' : 'Acessar como Loja'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
