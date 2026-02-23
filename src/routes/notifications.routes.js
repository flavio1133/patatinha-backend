const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { notifications, notificationTokens, nextNotificationId } = require('../data/notifications.data');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Registrar token de dispositivo (push)
router.post(
  '/tokens',
  authenticateToken,
  [body('token').notEmpty(), body('platform').optional(), body('device_id').optional()],
  validate,
  (req, res) => {
    const { token, platform = 'web', device_id } = req.body;
    const userId = req.user.userId ?? req.user.id;

    const existing = notificationTokens.find(
      (t) => String(t.user_id) === String(userId) && (device_id ? t.device_id === device_id : t.token === token)
    );

    const record = {
      id: 'tok_' + (notificationTokens.length + 1),
      user_id: userId,
      token,
      platform,
      device_id: device_id || null,
      is_active: true,
      last_used: new Date(),
      created_at: new Date(),
    };

    if (existing) {
      const idx = notificationTokens.indexOf(existing);
      notificationTokens[idx] = { ...existing, ...record };
      return res.json({ success: true, data: notificationTokens[idx] });
    }

    notificationTokens.push(record);
    res.json({ success: true, data: record });
  }
);

// Listar notificações do usuário
router.get('/', authenticateToken, (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const userId = req.user.userId ?? req.user.id;

  const userNotifs = notifications
    .filter((n) => String(n.user_id) === String(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  const unreadCount = notifications.filter(
    (n) => String(n.user_id) === String(userId) && n.status !== 'read'
  ).length;

  res.json({
    notifications: userNotifs,
    unread_count: unreadCount,
    total: userNotifs.length,
  });
});

// Marcar todas como lidas (antes de :id para não capturar "read-all" como id)
router.put('/read-all', authenticateToken, (req, res) => {
  const userId = req.user.userId ?? req.user.id;
  const now = new Date();
  notifications
    .filter((n) => String(n.user_id) === String(userId) && n.status !== 'read')
    .forEach((n) => {
      n.status = 'read';
      n.read_at = now;
    });
  res.json({ success: true });
});

// Marcar notificação como lida
router.put('/:id/read', authenticateToken, (req, res) => {
  const userId = req.user.userId ?? req.user.id;
  const notif = notifications.find(
    (n) => n.id === req.params.id && String(n.user_id) === String(userId)
  );
  if (!notif) return res.status(404).json({ error: 'Notificação não encontrada' });

  notif.status = 'read';
  notif.read_at = new Date();
  res.json({ success: true, notification: notif });
});

// Excluir notificação
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user.userId ?? req.user.id;
  const idx = notifications.findIndex(
    (n) => n.id === req.params.id && String(n.user_id) === String(userId)
  );
  if (idx === -1) return res.status(404).json({ error: 'Notificação não encontrada' });
  notifications.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
