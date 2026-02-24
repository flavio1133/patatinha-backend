const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { getLogs } = require('../services/audit.service');

// Apenas Gestor ou Super Administrador pode ver logs de auditoria
router.get('/', authenticateToken, requireRole('master', 'manager', 'super_admin'), (req, res) => {
  const { from, to, action, entity } = req.query;
  const logs = getLogs({
    from: from || undefined,
    to: to || undefined,
    action: action || undefined,
    entity: entity || undefined,
  });
  res.json({ logs });
});

module.exports = router;
