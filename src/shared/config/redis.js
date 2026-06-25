const Redis = require('ioredis');
const env = require('./env');
const { logger } = require('../utils/logger');

const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => {
  logger.error('Redis error:', err.message);
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.connect().catch((err) => {
  logger.error('Failed to connect to Redis:', err.message);
});

module.exports = redis;