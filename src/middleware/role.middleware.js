// Middleware de autorização por roles

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // req.user deve conter role após autenticação
    const userRole = req.user?.role || 'customer';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acesso negado',
        requiredRoles: allowedRoles,
        userRole: userRole,
      });
    }

    next();
  };
}

function requireAnyRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role || 'customer';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acesso negado',
        requiredRoles: allowedRoles,
        userRole: userRole,
      });
    }

    next();
  };
}

// Middleware para verificar se usuário pode acessar recurso de outro usuário
function canAccessResource(req, res, next) {
  const userRole = req.user?.role || 'customer';
  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;

  // Master e Gerente podem acessar qualquer recurso
  if (['master', 'manager'].includes(userRole)) {
    return next();
  }

  // Cliente só pode acessar seus próprios recursos
  if (userRole === 'customer' && resourceUserId && parseInt(resourceUserId) !== req.user.userId) {
    return res.status(403).json({
      error: 'Você só pode acessar seus próprios dados',
    });
  }

  next();
}

module.exports = {
  requireRole,
  requireAnyRole,
  canAccessResource,
};
