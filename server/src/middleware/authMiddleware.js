const jwt = require('jsonwebtoken');
const { createHttpError } = require('../utils/httpError');

const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Authentication token is required.'));
  }

  if (!process.env.JWT_SECRET) {
    return next(createHttpError(500, 'JWT configuration is missing.'));
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(createHttpError(401, 'Authentication token is required.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { iat, exp, ...user } = decoded;

    req.user = user;
    return next();
  } catch (error) {
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = authenticate;
