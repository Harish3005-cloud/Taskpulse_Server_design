const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../../shared/config/redis');
const env = require('../../shared/config/env');
const AppError = require('../../shared/utils/AppError');

// ─── TOKEN LIFECYCLE ──────────────────────────────────────────────
//
// The auth system uses a two-token strategy:
//
// 1. ACCESS TOKEN (JWT, 15 min)
//    - Short-lived, stateless, sent in Authorization header
//    - Contains user payload (id, email, tenantId)
//    - Verified using jwt.verify() which checks both the signature
//      (was it signed with our secret?) and expiry (is it still valid?)
//    - If compromised, damage is limited to 15 minutes
//
// 2. REFRESH TOKEN (opaque random string, 7 days)
//    - Long-lived, stored server-side in Redis (NOT in the JWT)
//    - Sent as an HttpOnly cookie (JavaScript cannot read it — XSS safe)
//    - Used ONLY to get a new access token when the old one expires
//    - On each refresh, the old refresh token is replaced (rotation)
//
// Flow:
//   Login → generateTokens() → access token (15m) + refresh token (7d)
//   API call → authenticate middleware → verifyAccessToken()
//   Token expired? → POST /auth/refresh → verifyRefreshToken() → new pair
//   Logout → delete refresh from Redis + blacklist access token
//
// ───────────────────────────────────────────────────────────────────

/**
 * Sign a 15-minute access token (JWT)
 *
 * HOW jwt.sign() WORKS:
 * 1. Takes the payload (user data) and encodes it as Base64
 * 2. Takes the secret key (env.JWT_SECRET) and creates an HMAC-SHA256
 *    signature of the encoded payload
 * 3. Combines them into: header.payload.signature (3 parts, dot-separated)
 *
 * The payload is NOT encrypted — anyone can decode it with jwt.decode().
 * But they CANNOT tamper with it, because the signature would no longer
 * match. Only our server (which knows JWT_SECRET) can create valid signatures.
 *
 * expiresIn: 900 = 900 seconds = 15 minutes
 * This adds an `exp` field to the payload (Unix timestamp of expiry).
 *
 * @param {Object} payload - { id, email, tenantId } — user identity claims
 * @returns {string} Signed JWT string like "eyJhbG...eyJpZC..."
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: Number(env.JWT_ACCESS_EXPIRES_IN) || 900 
  });
};

/**
 * Verify and decode an access token
 *
 * HOW jwt.verify() WORKS:
 * 1. Splits the token into header.payload.signature
 * 2. Re-signs header.payload with our JWT_SECRET
 * 3. Compares the computed signature with the received signature
 *    → If they don't match: token was tampered with → throws error
 * 4. Checks the `exp` field against current time
 *    → If current time > exp: token is expired → throws TokenExpiredError
 * 5. If both pass, returns the decoded payload object
 *
 * DIFFERENCE between verify() and decode():
 * - jwt.verify(token, secret)  → checks signature + expiry, SECURE
 * - jwt.decode(token)          → just decodes, NO validation, INSECURE
 *   We use decode() only in logout() where we just need the `exp` value
 *   from a token we're about to invalidate anyway.
 *
 * @param {string} token - JWT string from Authorization header
 * @returns {Object} Decoded payload: { id, email, tenantId, iat, exp }
 * @throws {AppError} 401 if token is invalid, tampered, or expired
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    // jwt.verify() throws JsonWebTokenError (bad signature) or
    // TokenExpiredError (past exp). We catch both and throw a clean 401.
    throw new AppError('Invalid or expired access token', 401);
  }
};

/**
 * Generate access + refresh token pair
 *
 * Called during: login, Google OAuth callback, token refresh
 *
 * WHY an opaque refresh token instead of another JWT?
 * - JWTs are stateless — once issued, you can't revoke them server-side
 * - An opaque token stored in Redis IS stateful — we can delete it
 *   instantly on logout, making it truly revocable
 * - This is why refresh tokens go in Redis (server-controlled)
 *   while access tokens are JWTs (client-controlled, short-lived)
 *
 * REFRESH TOKEN ROTATION:
 * - Each time we generate a new pair, the old refresh token in Redis
 *   is overwritten (same key: `refresh_token:{userId}`)
 * - This means only the LATEST refresh token is valid
 * - If an attacker steals an old refresh token, it's already invalid
 *
 * @param {string|ObjectId} userId - MongoDB user ID
 * @param {string} email - User's email (included in JWT payload)
 * @param {string} tenantId - Workspace/tenant ID (multi-tenancy)
 * @returns {Object} { accessToken: "eyJ...", refreshToken: "a3f8c..." }
 */
const generateTokens = async (userId, email, tenantId) => {
  // Build the JWT payload — only include what downstream routes need
  const payload = { id: userId.toString() };
  if (email) payload.email = email;
  if (tenantId) payload.tenantId = tenantId;

  // 1. Create a signed JWT access token (15 min lifespan)
  const accessToken = signAccessToken(payload);

  // 2. Create an opaque refresh token (NOT a JWT)
  //    crypto.randomBytes(40) generates 40 random bytes
  //    .toString('hex') converts to 80-char hex string — unguessable
  const refreshToken = crypto.randomBytes(40).toString('hex');
  
  // 3. Store refresh token in Redis with 7-day TTL (604800 seconds)
  //    Key pattern: "refresh_token:<userId>" → only ONE active per user
  //    SETEX = SET with EXpiry — Redis auto-deletes it after TTL
  const ttl = Number(env.JWT_REFRESH_EXPIRES_IN) || 604800;
  await redis.setex(`refresh_token:${userId}`, ttl, refreshToken);

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token against Redis store
 *
 * Called when the frontend's access token expires and it sends
 * POST /api/v1/auth/refresh with the refresh token cookie.
 *
 * HOW IT WORKS:
 * 1. Fetch the stored refresh token from Redis for this userId
 * 2. Compare it with the token the client sent
 * 3. If they match → user is legitimate, issue new tokens
 *    If they DON'T match → token was stolen/reused → reject
 *
 * WHY compare against Redis instead of just decoding?
 * Because the refresh token is NOT a JWT — it's a random string.
 * There's nothing to decode. The only way to validate it is by
 * checking it against what we stored server-side.
 *
 * @param {string} userId - The user claiming to own this token
 * @param {string} token - The refresh token from the cookie
 * @throws {AppError} 401 if token doesn't match or is expired (Redis TTL)
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
 *
 * WHY blacklist the access token?
 * - Access tokens are JWTs — they're stateless and self-contained
 * - Even after logout, a stolen access token is valid until it expires
 * - By adding it to a Redis blacklist, the auth middleware will reject
 *   it on the next request (see auth.middleware.js → blacklist check)
 * - The blacklist entry has the SAME TTL as the token's remaining life
 *   so Redis auto-cleans it when the token would have expired anyway
 *
 * HOW jwt.decode() is used here:
 * - We use decode() (NOT verify) because we don't need to validate
 *   the token — we just need its `exp` field to calculate remaining TTL
 * - The token was already verified by the auth middleware before
 *   reaching this logout handler
 *
 * @param {string} userId - User's MongoDB ID
 * @param {string} token - The current access token (from Authorization header)
 */
const logout = async (userId, token) => {
  // 1. Delete the refresh token from Redis → can't refresh anymore
  await redis.del(`refresh_token:${userId}`);

  // 2. Blacklist the current access token for its remaining lifetime
  if (token) {
    const decoded = jwt.decode(token); // decode only — no signature check needed
    if (decoded && decoded.exp) {
      // Calculate how many seconds until this token expires naturally
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        // Store in Redis: "blacklist:<token>" = "true" with auto-expiry
        // After TTL, Redis deletes this key — no stale blacklist entries
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