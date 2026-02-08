function readOnlyForViewers(req, res, next) {
  if (req.user && req.user.role === 'viewer' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions. Viewer role has read-only access.'
    });
  }
  next();
}

function requireRole(minimumRole) {
  const roleHierarchy = { admin: 2, viewer: 1 };
  return (req, res, next) => {
    const userLevel = roleHierarchy[req.user?.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;
    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: `Requires ${minimumRole} role or higher`
      });
    }
    next();
  };
}

module.exports = { readOnlyForViewers, requireRole };
