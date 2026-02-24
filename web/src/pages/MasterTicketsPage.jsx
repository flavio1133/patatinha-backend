import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI, masterAPI } from '../services/api';
import './DashboardPage.css';
import './AdminPetsPage.css';

const STATUS_LABEL = {
  open: 'Aberto',
  in_progress: 'Em análise',
  answered: 'Respondido',
  resolved: 'Resolvido',
};

export default function MasterTicketsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['master-tickets'],
    queryFn: () => ticketsAPI.listAll().then((res) => res.data),
    retry: 1,
  });

  const { data: staffData } = useQuery({
    queryKey: ['master-staff'],
    queryFn: () => masterAPI.getStaff().then((res) => res.data),
    retry: 1,
  });

  const tickets = data?.tickets || [];
  const staff = staffData?.staff || [];

  const { data: ticketDetail } = useQuery({
    queryKey: ['master-ticket', selectedId],
    queryFn: () => ticketsAPI.getMasterTicket(selectedId).then((res) => res.data),
    enabled: !!selectedId,
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => ticketsAPI.replyAsStaff(id, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-tickets']);
      if (selectedId) queryClient.invalidateQueries(['master-ticket', selectedId]);
      setReply('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }) => ticketsAPI.updateAsStaff(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['master-tickets']);
      if (selectedId) queryClient.invalidateQueries(['master-ticket', selectedId]);
    },
  });

  const handleReply = (e) => {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    replyMutation.mutate(
      { id: selectedId, message: reply },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao enviar resposta.');
        },
      }
    );
  };

  const handleStatusChange = (status) => {
    if (!selectedId) return;
    updateMutation.mutate(
      { id: selectedId, data: { status } },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao atualizar status.');
        },
      }
    );
  };

  const handleAssignToMe = () => {
    if (!selectedId) return;
    updateMutation.mutate(
      { id: selectedId, data: { assigned_to: 'me' } },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao atribuir ticket.');
        },
      }
    );
  };

  return (
    <div className="dashboard">
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Tickets / Sugestões</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
          Caixa de entrada centralizada das solicitações enviadas pelos gestores dos pet shops.
        </p>

        {isError && !data && (
          <div className="dashboard-api-error">
            <p>Não foi possível carregar os tickets.</p>
            <button type="button" className="btn-retry" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="admin-pets-page">
          <div className="admin-pets-header">
            <div>
              <h1>Caixa de Tickets</h1>
              <p className="admin-pets-sub">
                Priorize dúvidas, problemas técnicos e sugestões. Use o status para organizar o fluxo.
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 2fr)', gap: 24 }}>
            <div className="admin-pets-table-wrapper">
              <table className="admin-pets-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Assunto</th>
                    <th>Categoria</th>
                    <th>Status</th>
                    <th>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="admin-pets-empty">
                        Carregando tickets...
                      </td>
                    </tr>
                  )}
                  {!isLoading && tickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-pets-empty">
                        Nenhum ticket aberto até o momento.
                      </td>
                    </tr>
                  )}
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      style={{ cursor: 'pointer', background: selectedId === t.id ? 'rgba(255,255,255,0.06)' : undefined }}
                    >
                      <td>{t.company_name || '—'}</td>
                      <td>{t.subject}</td>
                      <td>{t.category}</td>
                      <td>
                        <span className={`status-badge status-${t.status || 'open'}`}>
                          {STATUS_LABEL[t.status] || t.status || 'Aberto'}
                        </span>
                      </td>
                      <td>{t.updated_at ? new Date(t.updated_at).toLocaleString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stat-card" style={{ minHeight: 320 }}>
              <div className="stat-icon">🎫</div>
              <div className="stat-content" style={{ width: '100%' }}>
                <div className="stat-label">Detalhes do ticket</div>
                {!selectedId || !ticketDetail ? (
                  <div className="stat-extra" style={{ marginTop: 16 }}>
                    Selecione um ticket na lista para ver a conversa e responder.
                  </div>
                ) : (
                  <>
                    <div className="stat-extra" style={{ marginTop: 4, marginBottom: 8 }}>
                      <strong>{ticketDetail.subject}</strong> · {ticketDetail.category} ·{' '}
                      <span className={`status-badge status-${ticketDetail.status || 'open'}`}>
                        {STATUS_LABEL[ticketDetail.status] || ticketDetail.status || 'Aberto'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 8 }}>
                      Loja: {ticketDetail.company_name || '—'}
                      {' · '}
                      Responsável:{' '}
                      {ticketDetail.assigned_to_user
                        ? ticketDetail.assigned_to_user.name
                        : 'Não atribuído'}
                    </div>
                    <div
                      style={{
                        maxHeight: 260,
                        overflowY: 'auto',
                        padding: '8px 0',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: 12,
                      }}
                    >
                      {ticketDetail.messages?.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            marginBottom: 8,
                            textAlign: m.from === 'staff' ? 'right' : 'left',
                          }}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              padding: '8px 12px',
                              borderRadius: 12,
                              background:
                                m.from === 'staff'
                                  ? 'rgba(56, 142, 60, 0.25)'
                                  : 'rgba(55, 65, 81, 0.7)',
                              color: '#e5e7eb',
                              maxWidth: '100%',
                            }}
                          >
                            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
                              {m.from === 'staff'
                                ? (m.author_name || 'Equipe Master')
                                : 'Gestor da loja'}
                              {' · '}
                              {m.created_at
                                ? new Date(m.created_at).toLocaleString('pt-BR')
                                : ''}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {m.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleReply}>
                      <textarea
                        rows={3}
                        placeholder="Escreva uma resposta para o cliente..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        style={{ width: '100%', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="submit"
                          className="btn-retry"
                          disabled={replyMutation.isLoading}
                        >
                          {replyMutation.isLoading ? 'Enviando...' : 'Responder'}
                        </button>
                        <button
                          type="button"
                          className="btn-admin-view"
                          onClick={handleAssignToMe}
                          disabled={updateMutation.isLoading}
                        >
                          Atribuir a mim
                        </button>
                        <button
                          type="button"
                          className="btn-admin-view"
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={updateMutation.isLoading}
                        >
                          Marcar em análise
                        </button>
                        <button
                          type="button"
                          className="btn-admin-view"
                          onClick={() => handleStatusChange('resolved')}
                          disabled={updateMutation.isLoading}
                        >
                          Marcar resolvido
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
