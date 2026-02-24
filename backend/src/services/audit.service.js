/**
 * Módulo de Logs de Auditoria.
 * Registra ações críticas (criação, edição, exclusão/desativação) com rastro de autoria e motivo quando obrigatório.
 */

const auditLogs = [];
let logIdCounter = 1;

/**
 * Registra uma ação no log de auditoria.
 * @param {Object} opts
 * @param {number} opts.userId - ID do usuário que executou a ação
 * @param {string} opts.userName - Nome do usuário (para exibição)
 * @param {string} opts.userRole - Papel do usuário (manager, master, super_admin, etc.)
 * @param {string} opts.action - 'create' | 'update' | 'delete' | 'deactivate' | 'reactivate'
 * @param {string} opts.entity - Entidade afetada: 'customer' | 'pet' | 'professional' | 'cashflow' | etc.
 * @param {number|string} opts.entityId - ID do registro
 * @param {Object} [opts.oldValue] - Snapshot do valor anterior (para update/delete)
 * @param {Object} [opts.newValue] - Snapshot do valor novo (para create/update)
 * @param {string} [opts.reason] - Motivo da alteração (obrigatório para delete/deactivate e alterações históricas)
 */
function logAudit(opts) {
  const entry = {
    id: logIdCounter++,
    userId: opts.userId,
    userName: opts.userName || 'Sistema',
    userRole: opts.userRole || 'unknown',
    action: opts.action,
    entity: opts.entity,
    entityId: opts.entityId,
    oldValue: opts.oldValue ?? null,
    newValue: opts.newValue ?? null,
    reason: opts.reason || null,
    createdAt: new Date().toISOString(),
  };
  auditLogs.push(entry);
  return entry;
}

/**
 * Retorna logs com filtros (apenas Gestor/Super Admin).
 * @param {Object} filters - { from, to (ISO date), action, entity }
 */
function getLogs(filters = {}) {
  let list = [...auditLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filters.from) {
    list = list.filter(l => l.createdAt >= filters.from);
  }
  if (filters.to) {
    const toEnd = filters.to.includes('T') ? filters.to : `${filters.to}T23:59:59.999Z`;
    list = list.filter(l => l.createdAt <= toEnd);
  }
  if (filters.action) {
    list = list.filter(l => l.action === filters.action);
  }
  if (filters.entity) {
    list = list.filter(l => l.entity === filters.entity);
  }

  return list;
}

module.exports = {
  logAudit,
  getLogs,
  auditLogs,
};
