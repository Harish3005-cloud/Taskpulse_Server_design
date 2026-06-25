class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;