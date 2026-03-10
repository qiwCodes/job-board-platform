const createHttpError = (statusCode, message, options = {}) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (options.name) {
    error.name = options.name;
  }

  if (options.code) {
    error.code = options.code;
  }

  if (options.errors) {
    error.errors = options.errors;
  }

  return error;
};

module.exports = {
  createHttpError,
};
