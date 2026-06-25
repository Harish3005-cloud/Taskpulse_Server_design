require('dotenv').config();

const required = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  API_URL: process.env.API_URL || 'http://localhost:3000',
  
  MONGODB_URI: process.env.MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL,
  
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || 900,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || 604800,
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
  
  SENTRY_DSN: process.env.SENTRY_DSN,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
};