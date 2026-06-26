const authService = require('./auth.service');
const User = require('./auth.model');
const Workspace = require('../workspaces/workspaces.model');
const AppError = require('../../shared/utils/AppError');
const { logger } = require('../../shared/utils/logger');

/**
 * POST /api/v1/auth/google/callback
 * Mock Google OAuth — accepts { email, name } in body.
 * Creates user + default workspace on first login.
 * Returns access token + sets refresh token cookie.
 */
const googleCallback = async (req, res, next) => {
  try {
    // req.user is populated by Passport strategy
    const { user, isNewUser } = req.user;

    // 2. Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user._id, user.email);

    // 3. Set HTTP-Only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Instead of responding with JSON, we redirect the user to the frontend dashboard
    // and pass the access token in the URL or let the frontend fetch it later.
    // For simplicity, we can redirect to a special frontend route that captures the token.
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/auth/success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan
    }))}`);

  } catch (error) {
    logger.error('Callback error:', error);
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=oauth_failed`);
  }
};

/**
 * POST /api/v1/auth/register
 * Register a new user with email and password
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }
    
    let user = await User.findOne({ email });
    if (user) {
      throw new AppError('User already exists with this email', 400);
    }
    
    user = await User.create({ email, password, name });
    
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      createdBy: user._id,
      members: [{ userId: user._id, role: 'owner' }]
    });
    user.tenantId = workspace._id;
    await user.save();
    
    const { accessToken, refreshToken } = await authService.generateTokens(user._id, user.email);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Login user with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }
    
    // Explicitly select password field for verification
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }
    
    const { accessToken, refreshToken } = await authService.generateTokens(user._id, user.email);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token from cookie.
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const { userId } = req.body;

    if (!token) {
      throw new AppError('No refresh token provided', 401);
    }

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    // Verify refresh token against Redis
    await authService.verifyRefreshToken(userId, token);

    // Fetch user to get email for the new token payload
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    // Issue new token pair (rotation)
    const { accessToken, refreshToken: newRefreshToken } = await authService.generateTokens(userId, user.email);

    // Update cookie with new refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.status(200).json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Clears refresh token from Redis + cookie.
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    // Remove refresh token from Redis and blacklist access token
    await authService.logout(userId, token);

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/'
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        plan: user.plan,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleCallback,
  register,
  login,
  refreshToken,
  logout,
  getMe
};