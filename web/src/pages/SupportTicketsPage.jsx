import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '../services/api';
import './DashboardPage.css';
import './AdminPetsPage.css';

const STATUS_LABEL = {
  open: 'Aberto',
  in_progress: 'Em análise',
  answered: 'Respondido',
  resolved: 'Resolvido',
};

export default function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    subject: '',
    category: 'Dúvida',
    message: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['company-tickets'],
    queryFn: () => ticketsAPI.listMine().then((res) => res.data),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => ticketsAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['company-tickets']);
      setForm({ subject: '', category: 'Dúvida', message: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    createMutation.mutate(
      {
        subject: form.subject,
        category: form.category,
        message: form.message,
      },
      {
        onError: (err) => {
          alert(err.response?.data?.error || 'Erro ao enviar ticket.');
        },
      }
    );
  };

  const tickets = data?.tickets || [];

  return (
    <div className="dashboard">
      <section className="dashboard-kpis">
        <h2 className="dashboard-section-title">Suporte / Sugestões</h2>
        <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
          Abra um chamado para falar com a equipe do sistema Patatinha. Dúvidas, problemas técnicos, sugestões e questões financeiras.
        </p>

        <form onSubmit={handleSubmit} className="dashboard-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-icon">💬</div>
            <div className="stat-content" style={{ width: '100%' }}>
              <div className="stat-label">Novo ticket de suporte</div>
              <div className="stat-extra">Explique o que está acontecendo. Nossa equipe irá responder dentro do horário comercial.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 16 }}>
                <input
                  type="text"
                  placeholder="Assunto (ex.: Dúvida sobre relatório)"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="Dúvida">Dúvida</option>
                  <option value="Problema Técnico">Problema Técnico</option>
                  <option value="Sugestão de Melhoria">Sugestão de Melhoria</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
              <textarea
                rows={4}
                placeholder="Descreva sua dúvida, problema ou sugestão com o máximo de detalhes possível."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                style={{ marginTop: 12, width: '100%' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#a0a0a0' }}>
                Anexos de imagem poderão ser enviados em uma próxima versão. Se necessário, mencione no texto que possui prints.
              </div>
              <button
                type="submit"
                className="btn-retry"
                style={{ marginTop: 16, alignSelf: 'flex-start' }}
                disabled={createMutation.isLoading}
              >
                {createMutation.isLoading ? 'Enviando...' : 'Enviar ticket'}
              </button>
            </div>
          </div>
        </form>

        {isError && !data && (
          <div className="dashboard-api-error">
            <p>Não foi possível carregar seus tickets.</p>
            <button type="button" className="btn-retry" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="admin-pets-page">
          <div className="admin-pets-header">
            <div>
              <h1>Histórico de Tickets</h1>
              <p className="admin-pets-sub">
                Acompanhe o status das suas solicitações de suporte e sugestões enviadas.
              </p>
            </div>
          </div>
          <div className="admin-pets-table-wrapper">
            <table className="admin-pets-table">
              <thead>
                <tr>
                  <th>Assunto</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="admin-pets-empty">
                      Você ainda não abriu nenhum ticket.
                    </td>
                  </tr>
                )}
                {tickets.map((t) => (
                  <tr key={t.id}>
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
        </div>
      </section>
    </div>
  );
}

