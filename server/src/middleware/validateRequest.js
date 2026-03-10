const { validationResult } = require('express-validator');
const { createHttpError } = require('../utils/httpError');

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const messages = [
    ...new Set(errors.array({ onlyFirstError: true }).map((error) => error.msg).filter(Boolean)),
  ];

  return next(
    createHttpError(422, 'Validation failed.', {
      name: 'ValidationError',
      errors: messages,
    }),
  );
};

module.exports = validateRequest;
