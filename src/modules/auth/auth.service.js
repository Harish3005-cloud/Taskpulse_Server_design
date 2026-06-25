const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../../shared/config/redis');
const env = require('../../shared/config/env');
const AppError = require('../../shared/utils/AppError');

/**
 * Sign a 15-minute access token
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: Number(env.JWT_ACCESS_EXPIRES_IN) || 900 
  });
};

/**
 * Verify and decode an access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired access token', 401);
  }
};

/**
 * Generate access + refresh token pair
 * Stores refresh token in Redis with 7-day TTL
 */
const generateTokens = async (userId, email, tenantId) => {
  const payload = { id: userId.toString() };
  if (email) payload.email = email;
  if (tenantId) payload.tenantId = tenantId;

  const accessToken = signAccessToken(payload);

  // Opaque refresh token (not JWT — stored in Redis)
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  const ttl = Number(env.JWT_REFRESH_EXPIRES_IN) || 604800;
  await redis.setex(`refresh_token:${userId}`, ttl, refreshToken);

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token against Redis store
 */
const verifyRefreshToken = async (userId, token) => {
  const storedToken = await redis.get(`refresh_token:${userId}`);
  if (!storedToken || storedToken !== token) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  return true;
};

/**
 * Logout — delete refresh token from Redis and blacklist access token
 */
const logout = async (userId, token) => {
  await redis.del(`refresh_token:${userId}`);

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, 'true');
      }
    }
  }
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateTokens,
  verifyRefreshToken,
  logout
};