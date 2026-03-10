const { createHttpError } = require('../utils/httpError');

const requireRole = (role) => (req, _res, next) => {
  if (!req.user) {
    return next(createHttpError(401, 'Authentication is required.'));
  }

  if (req.user.role !== role) {
    return next(createHttpError(403, 'You do not have permission to access this resource.'));
  }

  return next();
};

module.exports = requireRole;
