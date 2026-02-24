import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogsAPI } from '../services/api';
import './AuditLogsPage.css';

const ACTION_LABEL = {
  create: 'Criação',
  update: 'Edição',
  delete: 'Exclusão',
  deactivate: 'Desativação',
  reactivate: 'Reativação',
};

const ENTITY_LABEL = {
  customer: 'Cliente',
  pet: 'Pet',
  professional: 'Profissional',
  cashflow: 'Financeiro',
};

export default function AuditLogsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs', from, to, action, entity],
    queryFn: () =>
      auditLogsAPI.getLogs({
        from: from || undefined,
        to: to || undefined,
        action: action || undefined,
        entity: entity || undefined,
      }).then((r) => r.data),
  });

  const logs = data?.logs || [];

  return (
    <div className="audit-logs-page">
      <h1>Logs de Auditoria</h1>
      <p className="audit-desc">
        Ações críticas (desativações, alterações) com rastro de quem fez, quando e o motivo alegado.
      </p>

      <div className="audit-filters">
        <div className="filter-group">
          <label>De</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Até</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Ação</label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Entidade</label>
          <select value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(ENTITY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {isError && (
        <div className="audit-error">
          {error?.response?.status === 403
            ? 'Apenas Gestor ou Super Administrador pode ver os logs de auditoria.'
            : (error?.response?.data?.error || error?.message || 'Erro ao carregar logs.')}
        </div>
      )}

      {isLoading && <div className="audit-loading">Carregando...</div>}

      {!isLoading && !isError && (
        <div className="audit-table-wrap">
          {logs.length === 0 ? (
            <p className="audit-empty">Nenhum registro encontrado no período e filtros selecionados.</p>
          ) : (
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Papel</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>ID</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '-'}</td>
                    <td>{log.userName || '-'}</td>
                    <td>{log.userRole || '-'}</td>
                    <td>{ACTION_LABEL[log.action] || log.action}</td>
                    <td>{ENTITY_LABEL[log.entity] || log.entity}</td>
                    <td>{log.entityId ?? '-'}</td>
                    <td className="audit-reason">{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
