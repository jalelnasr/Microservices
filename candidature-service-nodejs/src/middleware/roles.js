const getUserRoles = (user) => user?.realm_access?.roles || [];

const hasAnyRole = (...allowedRoles) => (req, res, next) => {
  const roles = getUserRoles(req.user);
  const authorized = allowedRoles.some((role) => roles.includes(role));

  if (!authorized) {
    return res.status(403).json({
      error: 'Forbidden',
      requiredRoles: allowedRoles
    });
  }

  next();
};

const ownsCandidatureParamOrHasRole = (...allowedRoles) => (req, res, next) => {
  const roles = getUserRoles(req.user);
  const username = req.user?.preferred_username || req.user?.sub;

  if (allowedRoles.some((role) => roles.includes(role)) || req.params.userId === username) {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'You can only access your own candidatures'
  });
};

module.exports = {
  hasAnyRole,
  ownsCandidatureParamOrHasRole
};
