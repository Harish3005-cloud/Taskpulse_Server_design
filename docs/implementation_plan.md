# TaskPulse Production Deployment Plan

> Senior DevOps + Backend Architect review for deploying TaskPulse to production.
> Based on analysis of actual codebase: [app.js](file:///d:/SaaS/src/app.js), [server.js](file:///d:/SaaS/src/server.js), [env.js](file:///d:/SaaS/src/shared/config/env.js), [passport.js](file:///d:/SaaS/src/shared/config/passport.js), [docker-compose.yml](file:///d:/SaaS/docker-compose.yml), [.env](file:///d:/SaaS/.env), and [taskpulse_system_design.md](file:///d:/SaaS/taskpulse_system_design.md).

---

## Part 0 — Git Fix (Frontend Repo Secret Leak)

### Diagnosis

`git reset --soft HEAD~1` fails because commit `f850c69` is the **root commit** (the first and only commit). There is no `HEAD~1` — there's no parent to reset to.

### Fix: Remove the secret and recommit

Run these commands in `d:\SaaS\sample\sample-design`:

```powershell
# Step 1: Delete the secret file from the working directory
del src\assets\taskpulse-backend-user_accessKeys.csv

# Step 2: Remove the entire commit history (since it's the root commit)
#         This deletes the HEAD ref entirely, making the repo "brand new" while keeping files
git update-ref -d HEAD

# Step 3: Stage everything (the updated .gitignore now excludes *accessKeys*)
git add .

# Step 4: Verify the secret file is NOT staged
git status
# Make sure taskpulse-backend-user_accessKeys.csv does NOT appear in the staged files

# Step 5: Recommit
git commit -m "Initial commit: TaskPulse UI/UX frontend"

# Step 6: Push (no -f needed since we deleted history and remote rejected our first push)
git push -u origin main
```

> [!CAUTION]
> **Rotate your AWS keys NOW.** The file `taskpulse-backend-user_accessKeys.csv` contains your AWS Access Key ID (`AKIAU3LLROXIZ4C6OJMM`). Even though GitHub blocked the push, the key is already in your `.env` file which was pushed to the backend repo. Go to **AWS IAM Console → Users → Security Credentials → Deactivate & Create New Key**.

> [!WARNING]
> **Your `.env` file was pushed to the backend repo.** The backend's `.gitignore` has `.env` listed, but it was already committed in the initial backend commit. You need to also fix this:
> ```powershell
> # In d:\SaaS (backend repo)
> git rm --cached .env
> git commit -m "Remove .env from tracking"
> git push origin main
> ```
> Then rotate ALL secrets: JWT_SECRET, GOOGLE_CLIENT_SECRET, OPENROUTER_API_KEY, RAZORPAY_KEY_SECRET.

---

## Part 1 — Deployment Architecture Review

Based on analysis of your actual code, here are the critical findings:

### 🔴 Critical Issues (Must Fix Before Production)

| # | Issue | File | Detail |
|---|-------|------|--------|
| 1 | **Secrets exposed in git** | [.env](file:///d:/SaaS/.env) | `.env` was committed to the backend repo. Contains AWS keys, Google OAuth secrets, JWT secret, Razorpay keys, OpenRouter key. ALL must be rotated. |
| 2 | **Hardcoded fallback JWT secret** | [socket.js:22](file:///d:/SaaS/src/shared/config/socket.js#L22) | `'fallback_secret_for_dev_only'` — if `JWT_SECRET` env var is missing, anyone can forge tokens. Remove this fallback entirely. |
| 3 | **JWT_SECRET is a placeholder** | [.env:23](file:///d:/SaaS/.env#L23) | `your_jwt_secret_min_32_chars_change_this_in_prod` — must be a cryptographically random 64+ char string. |
| 4 | **No rate limiting** | [rateLimit.middleware.js](file:///d:/SaaS/src/shared/middleware/rateLimit.middleware.js) | File is empty. Your API is completely unprotected against brute force, DDoS, and abuse. |
| 5 | **No HTTPS enforcement** | [app.js](file:///d:/SaaS/src/app.js) | No redirect from HTTP→HTTPS. Tokens will be sent in plaintext. |
| 6 | **MongoDB has no auth** | [docker-compose.yml](file:///d:/SaaS/docker-compose.yml) | `MONGO_INITDB_DATABASE` is set but no `MONGO_INITDB_ROOT_USERNAME`/`PASSWORD`. Anyone who can reach port 27017 has full DB access. |

### 🟡 Important Issues (Should Fix)

| # | Issue | File | Detail |
|---|-------|------|--------|
| 7 | **No SIGINT handler** | [server.js](file:///d:/SaaS/src/server.js#L30) | Only `SIGTERM` is handled. Add `SIGINT` for container orchestrators and local dev. |
| 8 | **No MongoDB graceful disconnect** | [server.js](file:///d:/SaaS/src/server.js#L32-L35) | Graceful shutdown closes Redis but not MongoDB. Add `mongoose.connection.close()`. |
| 9 | **Socket room join has no authorization** | [socket.js:34](file:///d:/SaaS/src/shared/config/socket.js#L34) | Any authenticated user can join ANY workspace room. Must verify workspace membership. |
| 10 | **Error handler leaks stack in production** | [errorHandler.js](file:///d:/SaaS/src/shared/utils/errorHandler.js) | `err.stack` is logged but `err.message` is sent to client even for 500s. In production, generic messages should be sent for unexpected errors. |
| 11 | **No request ID middleware** | [errorHandler.js:17](file:///d:/SaaS/src/shared/utils/errorHandler.js#L17) | `req.id` is referenced but never set. Add a UUID middleware. |
| 12 | **CORS_ORIGIN is duplicated** | [.env](file:///d:/SaaS/.env#L5) and [.env:48](file:///d:/SaaS/.env#L48) | `CORS_ORIGIN` appears on lines 5 and 48. Only one will take effect. |
| 13 | **Missing env validation for production vars** | [env.js](file:///d:/SaaS/src/shared/config/env.js) | `GOOGLE_CALLBACK_URL`, `CORS_ORIGIN`, `API_URL` are not in the `required` array but are critical for production. |
| 14 | **Redis has no password** | [docker-compose.yml](file:///d:/SaaS/docker-compose.yml) | Redis is exposed on port 6379 with no `requirepass`. |

### 🟢 What's Already Good

- ✅ Helmet security headers
- ✅ Structured logging (Winston + Morgan)
- ✅ Health + readiness endpoints (`/health`, `/ready`)
- ✅ Graceful shutdown (partial — needs MongoDB)
- ✅ JWT blacklisting via Redis
- ✅ Cookie-based refresh tokens
- ✅ Dockerfile with healthcheck
- ✅ Environment variable validation (partial)
- ✅ Centralized error handling
- ✅ Swagger API docs

---

## Part 2 — Google OAuth Production Checklist

### OAuth Consent Screen: Test Mode vs Production Mode

| Aspect | Test Mode (Current) | Production Mode (Required) |
|--------|--------------------|-----------------------|
| **Who can log in** | Only emails listed as "test users" | Anyone with a Google account |
| **Max test users** | 100 | N/A |
| **Currently configured** | Only `eharish3005@gmail.com` | — |
| **What happens if someone else tries** | They see "Error 403: access_denied" | They see your consent screen normally |
| **Google verification** | Not required | Required if using sensitive scopes |

> [!IMPORTANT]
> **If you deploy to production while still in "Testing" mode, ONLY `eharish3005@gmail.com` can log in.** All other users will get `Error 403: access_denied`. This is the #1 most common OAuth deployment mistake.

### Pre-Production OAuth Steps

#### Step 1: Google Cloud Console Configuration

1. Go to [Google Cloud Console → APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. **Publishing status**: Click **"PUBLISH APP"** to move from Testing → Production
3. **App name**: Must match your product (e.g., "TaskPulse")
4. **User support email**: Must be a monitored email address
5. **Developer contact email**: Your real email
6. **App logo**: Upload a logo (improves trust)
7. **Privacy Policy URL**: You MUST have a publicly accessible privacy policy page (e.g., `https://yourdomain.com/privacy`)
8. **Terms of Service URL**: Recommended

#### Step 2: Scopes Review

Your app likely requests `email` and `profile` scopes. These are **non-sensitive** and do NOT require Google verification. You can go straight to production.

If you use any of these, you WILL need Google verification (takes 4-6 weeks):
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/calendar`
- Any Google Workspace API scope

#### Step 3: Authorized Redirect URIs

In [Google Cloud Console → Credentials → OAuth 2.0 Client](https://console.cloud.google.com/apis/credentials):

```
# REMOVE:
http://localhost:3000/api/v1/auth/google/callback

# ADD:
https://api.yourdomain.com/api/v1/auth/google/callback
```

> [!WARNING]
> Google OAuth **requires HTTPS** in production. `http://` callback URLs will be rejected (except for localhost during development).

#### Step 4: Authorized JavaScript Origins

```
# ADD:
https://yourdomain.com
https://www.yourdomain.com
https://api.yourdomain.com
```

#### Step 5: Environment Variables for Production

```env
# MUST change for production:
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback

# Keep the same (unless you create a new OAuth client):
GOOGLE_CLIENT_ID=71827762477-cd94d52cted6be0crg91h7gs4pn196gn.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<ROTATE THIS — it was exposed in git>
```

#### Step 6: Domain Requirements

- You MUST own the domain shown in the OAuth consent screen
- Google may ask you to verify domain ownership via DNS TXT record
- Railway provides free `*.up.railway.app` subdomains, but for production OAuth you want a custom domain

#### Common OAuth Deployment Mistakes

1. ❌ Deploying while still in "Testing" mode
2. ❌ Forgetting to update `GOOGLE_CALLBACK_URL` to production URL
3. ❌ Not adding production domain to "Authorized JavaScript origins"
4. ❌ Using HTTP instead of HTTPS for callback URL
5. ❌ Not having a privacy policy page
6. ❌ Hardcoding `localhost` anywhere in OAuth config
7. ❌ Not rotating client secret after it was exposed in git

---

## Part 3 — Infrastructure Deployment Checklist

### 3A. Backend Checklist

#### Environment Variables (Production `.env`)

```env
# ─── App ───
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# ─── Database ───
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/taskpulse?retryWrites=true&w=majority
# For Docker: mongodb://mongo_user:mongo_pass@mongo:27017/taskpulse?authSource=admin

# ─── Redis ───
REDIS_URL=redis://:your_redis_password@redis:6379

# ─── JWT (GENERATE NEW — run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))") ───
JWT_SECRET=<64-char-random-hex>
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800

# ─── Google OAuth ───
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<ROTATED-secret>
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback

# ─── OpenRouter ───
OPENROUTER_API_KEY=<ROTATED-key>
OPENROUTER_MODEL=openrouter/free

# ─── AWS S3 ───
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=<ROTATED-key>
AWS_SECRET_ACCESS_KEY=<ROTATED-secret>
AWS_S3_BUCKET_NAME=taskpulse-attachments-hari

# ─── Razorpay ───
RAZORPAY_KEY_ID=<production-key>
RAZORPAY_KEY_SECRET=<ROTATED-secret>

# ─── Email ───
RESEND_API_KEY=<production-key>

# ─── Monitoring ───
SENTRY_DSN=<production-dsn>
LOG_LEVEL=warn
LOG_FILE=logs/app.log
```

#### Build Process
- [ ] `npm ci --only=production` (not `npm install`)
- [ ] Ensure `NODE_ENV=production` is set
- [ ] Verify no devDependencies are needed at runtime

#### Health Checks
- [x] `/health` — liveness probe ✅ Already implemented
- [x] `/ready` — readiness probe (DB + Redis) ✅ Already implemented

#### API Security
- [ ] Implement rate limiting (currently empty file)
- [ ] Add CORS whitelist for production domain only
- [ ] Enable HTTPS-only cookies
- [ ] Add CSP headers via Helmet configuration
- [ ] Remove Swagger UI in production or add auth guard

---

### 3B. Database (MongoDB) Checklist

#### Production Configuration

```yaml
# docker-compose.prod.yml additions for MongoDB
mongo:
  image: mongo:7
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: <strong-password>
    MONGO_INITDB_DATABASE: taskpulse
  ports:
    - "127.0.0.1:27017:27017"  # Bind to localhost only
  volumes:
    - mongo_data:/data/db
  command: mongod --auth --wiredTigerCacheSizeGB 1
```

- [ ] **Authentication**: Enable `--auth` and create dedicated app user with `readWrite` role
- [ ] **Backup strategy**: 
  - `mongodump --gzip --archive` daily via cron
  - Store backups in S3 with 30-day retention
  - Test restore monthly
- [ ] **Connection pooling**: Mongoose defaults to `minPoolSize: 0, maxPoolSize: 100`. For production, set `maxPoolSize: 50` to prevent connection storms
- [ ] **SSL/TLS**: Use `ssl=true` in connection string for remote MongoDB (Atlas provides this by default)
- [ ] **Indexes**: Ensure indexes on `workspaceId`, `email`, `assignedTo`, `status`, `createdAt`
- [ ] **Disaster recovery**: Enable MongoDB replica set for automatic failover (or use MongoDB Atlas)

---

### 3C. Redis Checklist

```yaml
# docker-compose.prod.yml additions for Redis
redis:
  image: redis:7-alpine
  ports:
    - "127.0.0.1:6379:6379"  # Bind to localhost only
  command: >
    redis-server
    --requirepass <strong-redis-password>
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
    --appendonly yes
    --appendfsync everysec
  volumes:
    - redis_data:/data
```

- [ ] **Password**: Set `requirepass` (currently none)
- [ ] **Persistence**: Enable AOF (`appendonly yes`) for session data durability
- [ ] **Memory limit**: Set `maxmemory` to prevent OOM (256MB minimum for your use case)
- [ ] **Eviction policy**: `allkeys-lru` is appropriate since you use Redis for caching + sessions
- [ ] **Bind to localhost**: Don't expose 6379 to the internet

---

### 3D. Reverse Proxy (Nginx) Checklist

```nginx
# /etc/nginx/sites-available/taskpulse
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL (Let's Encrypt via certbot)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_types application/json text/plain application/javascript text/css;
    gzip_min_length 1000;

    # Proxy to Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;  # WebSocket keep-alive
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
    }

    client_max_body_size 10M;
}
```

- [ ] SSL via Let's Encrypt + auto-renewal
- [ ] HTTP → HTTPS redirect
- [ ] WebSocket upgrade headers (critical for Socket.IO)
- [ ] Request body size limit
- [ ] Gzip compression
- [ ] Security headers (HSTS, X-Frame-Options, etc.)

---

## Part 4 — Pre-Deployment Verification Checklist

Run these commands **before** deploying:

### 4.1 Environment Validation

```powershell
# Generate a production JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Expected: 128-char hex string — use this as JWT_SECRET
```

### 4.2 Backend Smoke Test (Local)

```powershell
# Start the server
npm start

# In a new terminal:

# Test health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok"}

# Test readiness endpoint
curl http://localhost:3000/ready
# Expected: {"status":"ready","database":"connected","redis":"connected"}

# Test 404 handler
curl http://localhost:3000/api/v1/nonexistent
# Expected: {"error":{"code":"NOT_FOUND","message":"Route /api/v1/nonexistent not found","status":404,...}}

# Test auth protection
curl http://localhost:3000/api/v1/tasks
# Expected: {"error":{"code":"...","message":"Access denied. No token provided.","status":401}}

# Test Swagger
curl -s http://localhost:3000/api-docs/ | head -5
# Expected: HTML page with Swagger UI
```

### 4.3 Database Tests

```powershell
# Verify MongoDB is running and accessible
docker exec saas_mongo mongosh --eval "db.runCommand('ping')"
# Expected: { ok: 1 }

# Check collections exist
docker exec saas_mongo mongosh taskpulse --eval "db.getCollectionNames()"
# Expected: Array of collection names

# Verify indexes
docker exec saas_mongo mongosh taskpulse --eval "db.tasks.getIndexes()"
```

### 4.4 Redis Tests

```powershell
# Verify Redis is running
docker exec saas_redis redis-cli ping
# Expected: PONG

# Check memory usage
docker exec saas_redis redis-cli info memory | findstr "used_memory_human"
# Expected: used_memory_human:<some small value like 1.5M>
```

### 4.5 OAuth Login Test

```powershell
# Open in browser — should redirect to Google consent screen
Start-Process "http://localhost:3000/api/v1/auth/google"

# After login, verify:
# 1. You're redirected back to CORS_ORIGIN
# 2. You receive an accessToken
# 3. The token works:
curl -H "Authorization: Bearer <your-access-token>" http://localhost:3000/api/v1/workspaces
# Expected: 200 with workspace data
```

### 4.6 Docker Build Test

```powershell
# Test the production Docker build
docker build -t taskpulse:test .
# Expected: Build completes successfully

# Test the container runs
docker run --rm -e NODE_ENV=production -e JWT_SECRET=test -e MONGODB_URI=mongodb://host.docker.internal:27017/taskpulse -e REDIS_URL=redis://host.docker.internal:6379 -e GOOGLE_CLIENT_ID=test -e GOOGLE_CLIENT_SECRET=test -p 3001:3000 taskpulse:test
# Expected: Server starts (may fail on DB connection if Docker network isn't configured, but that's ok)
```

---

## Part 5 — Post-Deployment Validation

After deployment, run through each of these:

### 5.1 Availability
- [ ] `curl https://api.yourdomain.com/health` → `{"status":"ok"}`
- [ ] `curl https://api.yourdomain.com/ready` → `{"status":"ready","database":"connected","redis":"connected"}`
- [ ] SSL certificate is valid: `curl -vI https://api.yourdomain.com 2>&1 | grep "SSL certificate verify ok"`

### 5.2 OAuth Login Flow
- [ ] Navigate to `https://api.yourdomain.com/api/v1/auth/google` in browser
- [ ] Google consent screen appears with correct app name
- [ ] Login with `eharish3005@gmail.com` succeeds
- [ ] Access token is returned
- [ ] Refresh token is stored in httpOnly cookie
- [ ] If in production mode: test with a second Google account

### 5.3 Core API
- [ ] `GET /api/v1/workspaces` with valid token → 200
- [ ] `POST /api/v1/tasks` with valid payload → 201
- [ ] `GET /api/v1/tasks` with workspace filter → 200 with correct data

### 5.4 Database & Redis
- [ ] MongoDB connection pool is stable (check `/ready` continuously for 5 minutes)
- [ ] Redis operations are fast (`< 5ms` for SET/GET)
- [ ] Token blacklisting works: logout then try using the old token → 401

### 5.5 WebSocket
- [ ] Socket.IO connection establishes from frontend
- [ ] Creating a task emits real-time event to workspace room

### 5.6 Error Handling
- [ ] Hit a 404 endpoint → structured error response (no stack trace in body)
- [ ] Sentry receives error reports (if configured)
- [ ] Winston logs are writing to file/stdout

### 5.7 Performance (Basic)
- [ ] API response time < 200ms for simple queries
- [ ] No memory leaks over 30 minutes of usage
- [ ] WebSocket connections don't drop unexpectedly

---

## Part 6 — Risk Assessment

### 🔴 High-Risk Items (Could Break Production)

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Exposed secrets in git** | Complete system compromise | Rotate ALL keys before deployment |
| **OAuth still in Test mode** | Only 1 user can log in | Publish app in Google Cloud Console |
| **No rate limiting** | DDoS or brute-force attack takes down API | Implement rate limiting middleware or use Nginx `limit_req` |
| **MongoDB no auth** | Complete data breach if port is exposed | Enable `--auth` and bind to localhost |
| **JWT fallback secret in socket.js** | Token forgery | Remove the fallback string |

### 🟡 Common First-Deployment Failures

1. **CORS mismatch**: Frontend URL doesn't match `CORS_ORIGIN` → login fails silently
2. **OAuth callback URL mismatch**: Production callback URL not added in Google Console → login redirects to localhost
3. **Database connection string wrong**: Typo in `MONGODB_URI` → server crashes on startup
4. **Redis not accessible**: Firewall blocks Redis port → rate limiter / token blacklist fails
5. **SSL not configured**: Google OAuth rejects HTTP callback → 400 error
6. **Cookie `SameSite` issues**: If frontend and backend are on different domains, cookies may be blocked
7. **WebSocket fails through proxy**: Nginx not configured for WebSocket upgrade → real-time features broken

### Rollback Strategy

```powershell
# If deployment fails, rollback immediately:

# Option 1: Railway (if using Railway)
# → Click "Rollback" in Railway dashboard to previous deployment

# Option 2: Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build  # with previous image tag

# Option 3: PM2
pm2 list         # Check current version
pm2 logs --err   # Check errors
pm2 revert 0     # Revert to previous version
```

### Emergency Recovery Plan

1. **Server won't start**: Check logs → `docker logs saas_app` or `pm2 logs`
2. **Database corrupted**: Restore from latest `mongodump` backup
3. **Redis down**: Server will still work for basic API but rate limiting and token blacklisting will fail. Restart Redis container.
4. **SSL cert expired**: `sudo certbot renew --force-renewal` then restart Nginx
5. **Complete failure**: Route DNS back to maintenance page, investigate offline

---

## Part 7 — Deployment Execution Runbook

### T-60 Minutes: Preparation

- [ ] **Rotate ALL compromised secrets**
  - AWS Access Key → IAM Console → Create new, deactivate old
  - Google Client Secret → Google Cloud Console → Create new OAuth credential
  - OpenRouter API Key → Dashboard → Regenerate
  - Razorpay Key → Dashboard → Regenerate
  - JWT Secret → Generate new: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] **Create production `.env` file** with all rotated secrets (see Part 3A)
- [ ] **Remove `.env` from backend git history** (see Part 0 warning)
- [ ] **Backup current database**: `docker exec saas_mongo mongodump --gzip --archive=/data/backup-$(date +%Y%m%d).gz`
- [ ] **Verify Docker images build successfully**: `docker build -t taskpulse:prod .`

### T-30 Minutes: Google OAuth Setup

- [ ] **Google Cloud Console → OAuth Consent Screen**
  - Set app name to "TaskPulse"
  - Add privacy policy URL
  - Add authorized domains
  - Click "PUBLISH APP" to move to production
- [ ] **Google Cloud Console → Credentials → OAuth Client**
  - Add production redirect URI: `https://api.yourdomain.com/api/v1/auth/google/callback`
  - Add authorized JavaScript origins: `https://yourdomain.com`
  - Keep localhost URIs for development

### T-10 Minutes: Infrastructure

- [ ] **Start production services**:
  ```powershell
  docker-compose -f docker-compose.prod.yml up -d mongo redis
  ```
- [ ] **Wait for health checks**:
  ```powershell
  docker exec saas_mongo mongosh --eval "db.runCommand('ping')"
  docker exec saas_redis redis-cli -a <password> ping
  ```
- [ ] **Configure Nginx** with SSL (see Part 3D)
- [ ] **Test SSL**: `curl -vI https://api.yourdomain.com`

### T-0: Deploy

- [ ] **Deploy backend**:
  ```powershell
  docker-compose -f docker-compose.prod.yml up -d app
  ```
- [ ] **Watch logs** for 2 minutes:
  ```powershell
  docker logs -f saas_app
  ```
- [ ] **Verify startup messages**:
  - ✓ MongoDB connected
  - ✓ Redis connected
  - ✓ Server running on port 3000

### T+5 Minutes: Smoke Tests

- [ ] `curl https://api.yourdomain.com/health` → `{"status":"ok"}`
- [ ] `curl https://api.yourdomain.com/ready` → `{"status":"ready",...}`
- [ ] Open `https://api.yourdomain.com/api/v1/auth/google` in browser → Google login works
- [ ] After login, test an API call with the token
- [ ] Check WebSocket: open frontend → verify real-time events

### T+15 Minutes: Validation

- [ ] Monitor error logs for 10 minutes: `docker logs -f saas_app 2>&1 | grep -i error`
- [ ] Check Sentry for any new errors
- [ ] Test with a second Google account (if OAuth is in production mode)
- [ ] Verify rate limiting works (if implemented)

### T+30 Minutes: Confirm

- [ ] No errors in logs for 30 minutes
- [ ] Memory usage is stable: `docker stats saas_app`
- [ ] Database connections are stable: `/ready` endpoint returns 200
- [ ] **Declare deployment successful** 🎉

### Rollback Criteria (Abort Deployment If)

- `/health` returns non-200 for more than 2 minutes
- MongoDB or Redis connection drops repeatedly
- Google OAuth login fails completely
- Error rate exceeds 5% of requests
- Memory usage grows unboundedly
- Any data corruption detected

---

## User Review Required

> [!IMPORTANT]
> **Before I proceed with any code changes, please confirm:**
> 1. Where are you deploying? (Railway, AWS EC2, DigitalOcean, VPS, etc.)
> 2. Do you have a custom domain ready, or will you use Railway's `*.up.railway.app`?
> 3. Do you want me to implement the missing rate limiting middleware now?
> 4. Should I create a `docker-compose.prod.yml` with all the production hardening?
> 5. Should I fix the socket.js fallback secret and the other code issues listed in Part 1?
