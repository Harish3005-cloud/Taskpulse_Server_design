const authService = require('../../modules/auth/auth.service');
const AppError = require('../utils/AppError');
const redis = require('../config/redis');

/**
 * Auth middleware — verifies JWT access token from Authorization header.
 * Populates req.user with decoded payload.
 * Returns 401 if token is missing, invalid, or blacklisted.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token is invalidated', 401);
    }

    const decoded = authService.verifyAccessToken(token);

    // Populate req.user for downstream handlers with full payload (id, email, etc.)
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = { authenticate };
