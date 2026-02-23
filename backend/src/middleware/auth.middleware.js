const jwt = require('jsonwebtoken');

// Middleware de autenticação JWT reutilizável
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
      // Company owner (type: 'company', role: 'owner') tem acesso equivalente a manager
      let role = user.role || 'customer';
      if (user.type === 'company' && user.role === 'owner') {
        role = 'manager';
      }
      req.user = {
        ...user,
        role,
      };
      next();
    }
  );
}

module.exports = { authenticateToken };
