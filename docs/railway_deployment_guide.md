# 🚀 TaskPulse Backend — Railway Deployment Guide

> A step-by-step walkthrough to deploy your backend on [Railway](https://railway.app). Follow in order.

---
# Backup deployment plan to use after 10 days 

Here's the step-by-step to set up MongoDB Atlas (free forever):

### Step 1: Create an Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or email

### Step 2: Create a Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** (the free tier)
3. **Provider**: AWS
4. **Region**: Pick `eu-north-1 (Stockholm)` — same region as your S3 bucket for lower latency
5. **Cluster name**: `taskpulse`
6. Click **"Create Deployment"**

### Step 3: Create a Database User
1. Atlas will prompt you to create a user:
   - **Username**: `taskpulse-app`
   - **Password**: Click **"Autogenerate Secure Password"** and **copy it**
2. Click **"Create Database User"**

### Step 4: Allow Network Access
1. Atlas will ask **"Where would you like to connect from?"**
2. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - This is needed because Railway's IP addresses change
3. Click **"Finish and Close"**

### Step 5: Get Your Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Copy the connection string — it looks like:
```
mongodb+srv://taskpulse-app:<password>@taskpulse.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Replace `<password>` with the password from Step 3
5. Add the database name before the `?`:
```
mongodb+srv://taskpulse-app:YOUR_PASSWORD@taskpulse.xxxxx.mongodb.net/taskpulse?retryWrites=true&w=majority
```

### Step 6: Update Railway
1. Go to Railway → **Taskpulse_Server_design** → **Variables**
2. Update `MONGODB_URI` with your new Atlas connection string
3. **Delete the MongoDB service** from Railway (click on MongoDB → Settings → Delete)

### Step 7: Verify
After Railway redeploys, check:
```
https://taskpulseserverdesign-production.up.railway.app/ready
```
Should show `{"status":"ready","database":"connected","redis":"connected"}`

---

### Atlas Free Tier Limits

| Resource | Free (M0) |
|----------|-----------|
| **Storage** | 512 MB |
| **RAM** | Shared |
| **Cost** | $0 forever |
| **Connections** | 500 |
| **Backups** | Included |

512 MB is plenty for thousands of tasks and users at your stage. Go ahead and start with Step 1!

---


## Status Check: What's Ready vs What Needs Work

| Area | Status | Notes |
|------|--------|-------|
| Backend code | ✅ Ready | Express + Socket.IO + all modules |
| Dockerfile | ✅ Ready | Multi-stage, healthcheck included |
| `.env` in git? | ✅ Safe | Never committed — confirmed |
| AWS credentials | ✅ Working | Verified via S3 bucket access |
| MongoDB (local) | ✅ Running | Via Docker Compose |
| Redis (local) | ✅ Running | Via Docker Compose |
| Rate limiting | ❌ Empty file | Works without it, add later |
| JWT Secret | ⚠️ Placeholder | Must generate a real one |
| Google OAuth | ⚠️ Test mode | Only your email can log in until you publish |

---

## Phase 1: Pre-Deployment Prep (Do This First)

### Step 1: Generate a Real JWT Secret

Run this in your terminal:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the output** — you'll need it in Step 5. It should be a 128-character hex string.

---

### Step 2: Push Latest Code to GitHub

Make sure your latest code is pushed:

```powershell
cd D:\SaaS
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

> [!IMPORTANT]
> Verify `.env` is **NOT** in the commit: run `git status` before pushing. The `.gitignore` already excludes it.

---

## Phase 2: Railway Setup (The Deployment)

### Step 3: Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **Sign in with GitHub**
3. Authorize Railway to access your GitHub repos

---

### Step 4: Create a New Project

1. From the Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub Repo"**
3. Find and select **`Harish3005-cloud/Taskpulse_Server_design`**
4. Railway will auto-detect your `Dockerfile` and start building

> [!NOTE]
> The first build will **fail** because the environment variables aren't set yet. That's expected — we'll fix it in the next step.

---

### Step 5: Add MongoDB & Redis (Railway Plugins)

Railway provides managed MongoDB and Redis as add-ons:

1. In your project dashboard, click **"+ New"** → **"Database"** → **"Add MongoDB"**
   - Railway will auto-create a MongoDB instance and give you a connection string
2. Click **"+ New"** → **"Database"** → **"Add Redis"**
   - Same — Railway auto-creates a Redis instance

After adding both, you'll see 3 services in your project:
- Your app (from GitHub)
- MongoDB
- Redis

---

### Step 6: Configure Environment Variables

Click on your **app service** → **"Variables"** tab → Add these one by one:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | `${{MongoDB.MONGO_URL}}` ← Railway auto-fills this reference |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` ← Railway auto-fills this reference |
| `JWT_SECRET` | *(paste the 128-char hex from Step 1)* |
| `JWT_ACCESS_EXPIRES_IN` | `900` |
| `JWT_REFRESH_EXPIRES_IN` | `604800` |
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET` |
| `GOOGLE_CALLBACK_URL` | *(set after Step 7 — you need your Railway URL first)* |
| `CORS_ORIGIN` | *(your frontend URL — set after frontend is deployed)* |
| `API_URL` | *(set after Step 7)* |
| `AWS_REGION` | `eu-north-1` |
| `AWS_ACCESS_KEY_ID` | `YOUR_AWS_ACCESS_KEY_ID` |
| `AWS_SECRET_ACCESS_KEY` | `YOUR_AWS_SECRET_ACCESS_KEY` |
| `AWS_S3_BUCKET_NAME` | `YOUR_AWS_S3_BUCKET_NAME` |
| `OPENROUTER_API_KEY` | `YOUR_OPENROUTER_API_KEY` |
| `OPENROUTER_MODEL` | `openrouter/free` |
| `RAZORPAY_KEY_ID` | `YOUR_RAZORPAY_KEY_ID` |
| `RAZORPAY_KEY_SECRET` | `YOUR_RAZORPAY_KEY_SECRET` |
| `LOG_LEVEL` | `warn` |

> [!TIP]
> **Railway variable references**: When you type `${{MongoDB.` Railway will show autocomplete options. Use the reference variable for `MONGO_URL` (or `MONGODB_URL` depending on the plugin version). Same for Redis. This way if the database restarts, the connection string auto-updates.

After adding variables, Railway will **auto-redeploy**. Wait for the build to complete.

---

### Step 7: Get Your Railway Public URL

1. Click on your app service → **"Settings"** tab
2. Under **"Networking"** → Click **"Generate Domain"**
3. Railway gives you a URL like: `taskpulse-server-design-production.up.railway.app`

Now go back to **Variables** and update these:

| Variable | Value |
|----------|-------|
| `API_URL` | `https://taskpulse-server-design-production.up.railway.app` |
| `GOOGLE_CALLBACK_URL` | `https://taskpulse-server-design-production.up.railway.app/api/v1/auth/google/callback` |
| `CORS_ORIGIN` | `http://localhost:5173` *(for now, update when frontend is deployed)* |

Railway will redeploy automatically.

---

### Step 8: Update Google OAuth (Critical!)

Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):

1. Click on your **OAuth 2.0 Client ID**
2. Under **"Authorized redirect URIs"**, add:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app/api/v1/auth/google/callback
   ```
3. Under **"Authorized JavaScript origins"**, add:
   ```
   https://YOUR-RAILWAY-URL.up.railway.app
   ```
4. Click **Save**

> [!WARNING]
> **Keep the `localhost` URIs** — you still need them for local development. Just ADD the production ones.

---

## Phase 3: Verify Deployment

### Step 9: Health Check

Open these URLs in your browser or run in PowerShell:

```powershell
# Test 1: Is the server alive?
Invoke-RestMethod "https://YOUR-RAILWAY-URL.up.railway.app/health"
# Expected: { status: "ok" }

# Test 2: Are DB and Redis connected?
Invoke-RestMethod "https://YOUR-RAILWAY-URL.up.railway.app/ready"
# Expected: { status: "ready", database: "connected", redis: "connected" }

# Test 3: Does auth protection work?
Invoke-RestMethod "https://YOUR-RAILWAY-URL.up.railway.app/api/v1/tasks"
# Expected: 401 error (no token)
```

### Step 10: Test Google Login

1. Open in browser: `https://YOUR-RAILWAY-URL.up.railway.app/api/v1/auth/google`
2. Google consent screen should appear
3. Log in with `eharish3005@gmail.com`
4. You should be redirected back with a token

### Step 11: Check Swagger Docs

Open: `https://YOUR-RAILWAY-URL.up.railway.app/api-docs`

You should see the full API documentation.

---

## Phase 4: Google OAuth — Publishing (When Ready for Other Users)

> [!IMPORTANT]
> Right now, **only your email** (`eharish3005@gmail.com`) can log in because Google OAuth is in "Testing" mode. Do this when you're ready for other users:

1. Go to [Google Cloud Console → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Click **"PUBLISH APP"**
3. Google will ask you to verify:
   - Your scopes (`email`, `profile`) are non-sensitive → **No review needed**
   - You DO need a **Privacy Policy URL** — even a simple page works
4. After publishing, anyone with a Google account can log in

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Railway build logs — usually a missing dependency or env var |
| `Cannot connect to MongoDB` | Check the `MONGODB_URI` variable — use Railway's reference format `${{MongoDB.MONGO_URL}}` |
| `Cannot connect to Redis` | Same — use `${{Redis.REDIS_URL}}` reference |
| Google login gives 403 | OAuth is still in Testing mode, or redirect URI mismatch |
| Google login gives `redirect_uri_mismatch` | The callback URL in Google Console doesn't match `GOOGLE_CALLBACK_URL` exactly |
| CORS errors from frontend | Update `CORS_ORIGIN` to match your frontend URL exactly (including `https://`) |
| WebSocket not connecting | Railway supports WebSocket out of the box, but check your Socket.IO client URL matches the Railway URL |
| App crashes on startup | Check Railway logs: click your service → "Logs" tab |

---

## Railway Free Tier Limits

| Resource | Free Tier |
|----------|-----------|
| **Execution hours** | 500 hours/month (enough for 1 always-on service) |
| **RAM** | 512 MB (sufficient for your app) |
| **Storage** | 1 GB (sufficient) |
| **Network** | 100 GB egress/month |
| **Databases** | Included (MongoDB + Redis both run as separate services) |

> [!NOTE]
> Railway's free tier requires a credit card on file (for verification, not charged). If you exceed limits, they charge ~$5/month for the hobby plan.

---

## What's Next After Deployment?

Once the backend is live and verified:

1. **Deploy the frontend** (Vercel/Netlify recommended for React) and update `CORS_ORIGIN`
2. **Add a custom domain** in Railway Settings → Networking → Custom Domain
3. **Publish Google OAuth** to allow other users to sign in
4. **Implement rate limiting** (the middleware file is currently empty)
5. **Set up monitoring** — add a real Sentry DSN for error tracking
