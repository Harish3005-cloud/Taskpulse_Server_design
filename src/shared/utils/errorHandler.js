const { logger } = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';

  logger.error(`[${code}] ${message}`, { status, stack: err.stack });

  res.status(status).json({
    error: {
      code,
      message,
      status,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
    },
  });
};

module.exports = errorHandler;