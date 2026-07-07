# 🐳 Docker Guide for TaskPulse SaaS

> A beginner-friendly explanation of how Docker works in this project.

---

## 📌 What is Docker? (Super Simple)

Think of Docker as a **"shipping container for your app"**.

- Normally, your app runs on YOUR computer. It might not work on someone else's machine because they have different software installed.
- Docker packages your app + all its dependencies into a **container** — an isolated mini-computer that runs the same everywhere.
- A **Docker image** is the blueprint (recipe). A **container** is the running instance (the actual dish).

---

## 📄 Dockerfile — Line by Line

> The `Dockerfile` tells Docker **how to build your app's image**.

```dockerfile
FROM node:18-alpine
```
📦 **Start with this base image** — Downloads a pre-built mini Linux computer that already has Node.js 18 installed.  
(`alpine` = tiny, lightweight version of Linux)

```dockerfile
WORKDIR /app
```
📁 **Set the working directory** — Creates `/app` inside the container and `cd`s into it. All future commands run here.

```dockerfile
COPY package*.json ./
```
📋 **Copy package files** — Copies `package.json` and `package-lock.json` from your computer INTO the container. This tells Docker what npm packages to install.

```dockerfile
RUN npm ci --only=production
```
⚙️ **Install npm packages** — Runs during the *build* phase. `npm ci` is like `npm install` but faster and more reliable for production builds.

```dockerfile
COPY src ./src
```
📂 **Copy your source code** — Copies your entire `src/` folder into the container.

```dockerfile
EXPOSE 3000
```
🔌 **Document the port** — A label/hint that says this app listens on port 3000. Doesn't actually open the port (docker-compose does that).

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```
🩺 **Health check** — Every 30 seconds, Docker pings your `/health` endpoint. If it fails 3 times in a row, the container is marked as **unhealthy**.

```dockerfile
CMD ["node", "src/server.js"]
```
▶️ **Default start command** — Runs `node src/server.js` when the container starts.  
> ⚠️ Note: `docker-compose.yml` overrides this with `npm run dev` for development.

---

## 📄 docker-compose.yml — The Orchestrator

Docker Compose lets you run **multiple containers together** as a system.  
Your app needs 3 things: MongoDB, Redis, and the Node.js app.

```
┌─────────────────────────────────┐
│        saas_default (network)   │
│                                 │
│  ┌──────────┐   ┌───────────┐   │
│  │saas_mongo│   │saas_redis │   │
│  │ :27017   │   │  :6379    │   │
│  └────┬─────┘   └─────┬─────┘   │
│       │               │         │
│       └──────┬────────┘         │
│           ┌──┴──────┐           │
│           │saas_app │           │
│           │  :3000  │           │
│           └─────────┘           │
└─────────────────────────────────┘
```

---

### 🍃 Service 1: `mongo` (Database)

```yaml
mongo:
  image: mongo:7                        # Use official MongoDB v7 (no build needed)
  container_name: saas_mongo
  ports:
    - "27017:27017"                     # host_port:container_port
  environment:
    MONGO_INITDB_DATABASE: taskpulse    # Create a DB named "taskpulse" on startup
  volumes:
    - mongo_data:/data/db               # Persist DB data (survives restarts!)
  healthcheck:
    test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test
    interval: 10s                       # Check every 10 seconds
    timeout: 5s
    retries: 5                          # Try 5 times before marking unhealthy
```

> 💡 **Port mapping `"27017:27017"`** — When you connect to `localhost:27017` on your computer, it is forwarded INTO the container's port 27017.

---

### 🔴 Service 2: `redis` (Cache / Queue)

```yaml
redis:
  image: redis:7-alpine       # Official lightweight Redis image
  container_name: saas_redis
  ports:
    - "6379:6379"             # Redis's default port
  volumes:
    - redis_data:/data        # Persist Redis data
  healthcheck:
    test: redis-cli ping      # Simple ping to check Redis is alive
    interval: 10s
    timeout: 5s
    retries: 5
```

---

### ⚡ Service 3: `app` (Your Node.js App)

```yaml
app:
  build: .                            # BUILD image from Dockerfile in current folder
  container_name: saas_app
  ports:
    - "3000:3000"                     # API available at http://localhost:3000
  environment:
    NODE_ENV: development
    MONGODB_URI: mongodb://mongo:27017/taskpulse   # "mongo" = container name = hostname
    REDIS_URL: redis://redis:6379                  # "redis" = container name = hostname
  depends_on:
    mongo:
      condition: service_healthy      # ⏳ Wait for MongoDB healthcheck to pass
    redis:
      condition: service_healthy      # ⏳ Wait for Redis healthcheck to pass
  volumes:
    - .:/app                          # Mount local code → live reload on file changes!
    - /app/node_modules               # Keep container's node_modules separate
  command: npm run dev                # Override Dockerfile CMD for development
```

> 🔑 **Key insight**: Inside Docker's network, containers talk to each other using their **service names as hostnames**.  
> So `mongodb://mongo:27017` means *"connect to the container named `mongo`"* — no IP address needed!

---

### 💾 Named Volumes (Persistent Storage)

```yaml
volumes:
  mongo_data:    # Docker manages this on your hard drive
  redis_data:    # Data survives even when containers are deleted
```

> Named volumes persist your database data across `docker-compose down` restarts.  
> Only `docker-compose down -v` deletes them (use with caution ⚠️).

---

## ▶️ What Happens: `docker-compose up -d`

```
Step 1: Pull images
  └── Downloads mongo:7 and redis:7-alpine from Docker Hub (first time only)

Step 2: Build your app image
  └── Reads your Dockerfile
  └── Installs npm packages (npm ci)
  └── Copies your src/ code

Step 3: Create a private network (saas_default)
  └── All 3 containers can talk to each other by name

Step 4: Start mongo + redis first (no dependencies)
  └── Waits for their healthchecks to pass ✅

Step 5: Start your app container
  └── Runs: npm run dev
  └── App connects to MongoDB and Redis using container names as hostnames
```

The **`-d`** flag means **"detached"** — runs everything in the background so your terminal stays free.

**Expected output:**
```
✔ Container saas_mongo  Started
✔ Container saas_redis  Started
✔ Container saas_app    Started
```

Your app is now live at **`http://localhost:3000`** 🎉

---

## ⏹️ What Happens: `docker-compose down`

```
[+] Running 4/4
✔ Container saas_app    Removed   ← Node app stopped & deleted
✔ Container saas_mongo  Removed   ← MongoDB stopped & deleted
✔ Container saas_redis  Removed   ← Redis stopped & deleted
✔ Network saas_default  Removed   ← Private network deleted
```

> ✅ **Your data is safe!** Named volumes (`mongo_data`, `redis_data`) are **NOT** deleted.  
> To also delete all data: `docker-compose down -v` ⚠️ (irreversible!)

---

## 🐛 Why `npm run dev` Fails Without Docker

When you run `npm run dev` directly on your machine, you get **Redis errors** because:

- Redis is only available **inside a Docker container**
- Without `docker-compose up -d`, there's no Redis server for your app to connect to

**The correct workflow:**

```bash
# Step 1: Start all containers (MongoDB + Redis + App)
docker-compose up -d

# Step 2: Check they're running
docker-compose ps

# Step 3: Watch logs (optional)
docker-compose logs -f app

# Step 4: When done, stop everything
docker-compose down
```

---

## 🗺️ Quick Reference Cheat Sheet

| Command | What it does |
|---|---|
| `docker-compose up -d` | Start all containers in the background |
| `docker-compose down` | Stop & remove containers (data kept) |
| `docker-compose down -v` | Stop & remove containers + data ⚠️ |
| `docker-compose logs -f` | Watch live logs from all containers |
| `docker-compose logs -f app` | Watch logs from only your app |
| `docker-compose ps` | See running containers & their status |
| `docker-compose restart app` | Restart just your app container |
| `docker-compose build` | Rebuild your app image (after code changes) |
| `docker-compose up -d --build` | Rebuild + restart in one command |

---

## 🧠 Key Concepts Summary

| Term | Simple Explanation |
|---|---|
| **Image** | A blueprint/recipe for a container |
| **Container** | A running instance of an image |
| **Volume** | Persistent storage that survives container restarts |
| **Network** | Private network connecting containers |
| **Port mapping** | `host:container` — forwards traffic from your PC into a container |
| **Healthcheck** | A periodic test to verify the container is working |
| **depends_on** | Ensures one container waits for another to be healthy before starting |
