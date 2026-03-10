const multer = require('multer');

const JWT_ERROR_NAMES = new Set(['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError']);

module.exports = (error, _req, res, _next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(error);

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Resume file size must not exceed 5MB.'
        : error.message || 'Invalid file upload.';

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (error.name === 'ValidationError' || error.statusCode === 422 || Array.isArray(error.errors)) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: Array.isArray(error.errors) && error.errors.length > 0 ? error.errors : [error.message],
    });
  }

  if (JWT_ERROR_NAMES.has(error.name)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }

  if (error.statusCode && error.statusCode < 500) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  const response = {
    success: false,
    message: 'Internal server error.',
  };

  if (!isProduction) {
    response.details = error.message;
    response.stack = error.stack;
  }

  return res.status(500).json(response);
};
