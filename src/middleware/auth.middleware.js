const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production',
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
      let role = user.role || 'customer';
      if (user.type === 'company' && user.role === 'owner') {
        role = 'manager';
      }
      if (user.type === 'company') {
        req.companyId = user.companyId || user.id;
      }
      req.user = { ...user, role };
      next();
    }
  );
}

module.exports = { authenticateToken };