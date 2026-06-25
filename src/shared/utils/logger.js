const winston = require('winston');
const path = require('path');
const env = require('../config/env');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}] ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: env.LOG_FILE,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

const morganFormat = ':remote-addr - :method :url :status :res[content-length] - :response-time ms';

module.exports = { logger, morganFormat };