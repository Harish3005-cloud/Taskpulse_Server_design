# TaskPulse — Complete System Architecture (Mermaid)

> Full intended architecture for the production-ready TaskPulse SaaS.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Clients
        Browser["🌐 React Frontend<br/>localhost:3001"]
        Mobile["📱 Mobile Client"]
        Postman["🔧 Postman / CLI"]
    end

    subgraph LoadBalancer["Cloud Platform (Railway)"]
        LB["Load Balancer / Reverse Proxy"]
    end

    subgraph AppServer["Node.js Application Server :3000"]
        Express["Express.js"]

        subgraph MiddlewareStack["Middleware Pipeline"]
            Sentry["Sentry Error Tracking"]
            Helmet["Helmet (Security Headers)"]
            CORS["CORS"]
            JSONParser["JSON Body Parser"]
            Morgan["Morgan → Winston Logger"]
            RateLimit["Rate Limiter (Redis-backed)"]
        end

        subgraph APIRoutes["API Routes /api/v1"]
            AuthRoutes["Auth Routes<br/>/auth/*"]
            WorkspaceRoutes["Workspace Routes<br/>/workspaces/*"]
            TaskRoutes["Task Routes<br/>/tasks/*"]
            AnalyticsRoutes["Analytics Routes<br/>/analytics/*"]
            InviteRoutes["Invite Routes<br/>/invites/*"]
            BillingRoutes["Billing Routes<br/>/checkout-session<br/>/webhook/stripe"]
        end

        subgraph SharedMiddleware["Shared Middleware"]
            AuthMW["Auth Middleware<br/>(JWT Verify + req.user)"]
            TenantMW["Tenant Scope Middleware<br/>(Workspace Isolation)"]
        end

        subgraph Services["Business Logic Services"]
            AuthService["Auth Service<br/>(OAuth, JWT, Tokens)"]
            WorkspaceService["Workspace Service<br/>(CRUD, Members)"]
            TaskService["Task Service<br/>(CRUD, AI Integration)"]
            AIService["AI Scoring Service<br/>(OpenRouter API)"]
            AnalyticsService["Analytics Service<br/>(Aggregation, Digest)"]
            InviteService["Invite Service<br/>(Token Gen, Email)"]
            BillingService["Billing Service<br/>(Stripe Integration)"]
        end

        WebSocket["Socket.IO Server<br/>(Real-Time Events)"]
        CronJobs["node-cron<br/>(Weekly AI Digest)"]
        SwaggerUI["Swagger UI<br/>/api-docs"]
    end

    subgraph DataStores["Data Layer"]
        MongoDB[("MongoDB 7<br/>:27017<br/>Primary Database")]
        Redis[("Redis 7<br/>:6379<br/>Cache + Sessions")]
    end

    subgraph ExternalServices["External Services"]
        Google["Google OAuth 2.0<br/>(Authentication)"]
        OpenRouter["OpenRouter API<br/>(AI Task Scoring)"]
        Stripe["Stripe API<br/>(Billing + Webhooks)"]
        S3["AWS S3<br/>(File Uploads)"]
        Resend["Resend<br/>(Transactional Email)"]
        SentryCloud["Sentry Cloud<br/>(Error Monitoring)"]
    end

    %% Client connections
    Browser --> LB
    Mobile --> LB
    Postman --> LB
    LB --> Express
    Browser <-.->|WebSocket| WebSocket

    %% Middleware flow
    Express --> MiddlewareStack
    MiddlewareStack --> APIRoutes

    %% Route → Middleware → Service
    APIRoutes --> SharedMiddleware
    SharedMiddleware --> Services

    %% Service → Data
    AuthService --> MongoDB
    AuthService --> Redis
    WorkspaceService --> MongoDB
    TaskService --> MongoDB
    AIService --> Redis
    AnalyticsService --> MongoDB
    AnalyticsService --> Redis
    InviteService --> MongoDB
    BillingService --> MongoDB

    %% Service → External
    AuthService -.-> Google
    AIService -.-> OpenRouter
    BillingService -.-> Stripe
    TaskService -.-> S3
    InviteService -.-> Resend
    CronJobs -.-> Resend
    Sentry -.-> SentryCloud

    %% WebSocket connections
    TaskService --> WebSocket
    WebSocket --> Redis

    %% Cron
    CronJobs --> AnalyticsService
    CronJobs --> AIService

    %% Rate limiter
    RateLimit --> Redis

    %% Styling
    classDef done fill:#22c55e,stroke:#16a34a,color:#fff
    classDef partial fill:#f59e0b,stroke:#d97706,color:#fff
    classDef notstarted fill:#6b7280,stroke:#4b5563,color:#fff
    classDef external fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef database fill:#3b82f6,stroke:#2563eb,color:#fff

    class Express,Helmet,CORS,JSONParser,Morgan done
    class AuthRoutes,AuthService partial
    class WorkspaceRoutes,TaskRoutes,AnalyticsRoutes,InviteRoutes,BillingRoutes notstarted
    class RateLimit,AuthMW,TenantMW,WebSocket,CronJobs,SwaggerUI notstarted
    class WorkspaceService,TaskService,AIService,AnalyticsService,InviteService,BillingService notstarted
    class Google,OpenRouter,Stripe,S3,Resend,SentryCloud external
    class MongoDB,Redis database
```

---

## 2. API Route Map

```mermaid
graph LR
    subgraph API["/api/v1"]

        subgraph Auth["/auth"]
            A1["POST /google<br/>→ Initiate OAuth"]
            A2["POST /google/callback<br/>→ Handle OAuth callback"]
            A3["POST /refresh<br/>→ Refresh access token"]
            A4["POST /logout<br/>→ Blacklist refresh token"]
        end

        subgraph Workspaces["/workspaces"]
            W1["GET /<br/>→ List user's workspaces"]
            W2["GET /:id<br/>→ Get workspace details"]
            W3["POST /<br/>→ Create workspace"]
            W4["PATCH /:id<br/>→ Update workspace"]
            W5["POST /:id/invites<br/>→ Create invite link"]
        end

        subgraph Tasks["/tasks"]
            T1["GET /<br/>→ List tasks (filter, sort, paginate)"]
            T2["GET /:id<br/>→ Get task details"]
            T3["POST /<br/>→ Create task + AI score"]
            T4["PATCH /:id<br/>→ Update task"]
            T5["DELETE /:id<br/>→ Soft-delete task"]
            T6["POST /:id/attachments<br/>→ Upload file (S3 presigned URL)"]
        end

        subgraph Invites["/invites"]
            I1["GET /:token<br/>→ Validate invite token"]
            I2["POST /:token/claim<br/>→ Join workspace"]
        end

        subgraph Analytics["/analytics"]
            AN1["GET /?range=7d|30d|90d<br/>→ Dashboard stats"]
            AN2["GET /digest<br/>→ Latest AI weekly digest"]
        end

        subgraph Billing["/billing"]
            B1["POST /checkout-session<br/>→ Stripe Checkout"]
            B2["POST /webhook/stripe<br/>→ Payment webhook"]
            B3["PATCH /user/plan<br/>→ Update user plan"]
        end
    end

    subgraph HealthChecks["Health Checks"]
        H1["GET /health<br/>→ Liveness probe"]
        H2["GET /ready<br/>→ Readiness probe (DB + Redis)"]
    end

    subgraph Docs["Documentation"]
        D1["GET /api-docs<br/>→ Swagger UI"]
    end

    %% Styling
    classDef authStyle fill:#22c55e,stroke:#16a34a,color:#fff
    classDef workStyle fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef taskStyle fill:#f59e0b,stroke:#d97706,color:#fff
    classDef inviteStyle fill:#ec4899,stroke:#db2777,color:#fff
    classDef analyticStyle fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef billingStyle fill:#ef4444,stroke:#dc2626,color:#fff
    classDef healthStyle fill:#10b981,stroke:#059669,color:#fff

    class A1,A2,A3,A4 authStyle
    class W1,W2,W3,W4,W5 workStyle
    class T1,T2,T3,T4,T5,T6 taskStyle
    class I1,I2 inviteStyle
    class AN1,AN2 analyticStyle
    class B1,B2,B3 billingStyle
    class H1,H2,D1 healthStyle
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant API as Express API
    participant MW as Auth Middleware
    participant AS as Auth Service
    participant G as Google OAuth
    participant DB as MongoDB
    participant R as Redis

    Note over C,R: === LOGIN FLOW (Google OAuth) ===

    C->>API: POST /api/v1/auth/google
    API->>G: Redirect to Google Consent Screen
    G-->>C: User grants permission
    C->>API: POST /api/v1/auth/google/callback (code)
    API->>G: Exchange code for Google tokens
    G-->>API: { email, name, googleId, avatar }
    API->>AS: handleGoogleCallback(profile)
    AS->>DB: findOne({ email }) or create User
    DB-->>AS: User document
    AS->>AS: signAccessToken(userId) → 15-min JWT
    AS->>AS: signRefreshToken(userId) → 7-day JWT
    AS->>R: SET refresh_token:{userId} = token (TTL 7d)
    AS-->>API: { accessToken, refreshToken }
    API-->>C: 200 { accessToken } + Set-Cookie: refreshToken (httpOnly)

    Note over C,R: === AUTHENTICATED REQUEST ===

    C->>API: GET /api/v1/tasks (Authorization: Bearer <accessToken>)
    API->>MW: Verify JWT
    MW->>MW: jwt.verify(token, secret)
    MW->>MW: Populate req.user = { id, email, tenantId }
    MW->>API: next()
    API->>DB: Query tasks (scoped by workspaceId)
    DB-->>API: Task documents
    API-->>C: 200 { tasks: [...] }

    Note over C,R: === TOKEN REFRESH ===

    C->>API: POST /api/v1/auth/refresh (Cookie: refreshToken)
    API->>AS: refreshTokens(userId, token)
    AS->>R: GET refresh_token:{userId}
    R-->>AS: Stored token
    AS->>AS: Compare tokens
    AS->>AS: Sign new accessToken (15 min)
    AS->>AS: Sign new refreshToken (7 days)
    AS->>R: SET refresh_token:{userId} = newToken (TTL 7d)
    AS-->>API: { accessToken, refreshToken }
    API-->>C: 200 { accessToken } + Set-Cookie: refreshToken

    Note over C,R: === LOGOUT ===

    C->>API: POST /api/v1/auth/logout
    API->>AS: logout(userId, token)
    AS->>R: DEL refresh_token:{userId}
    AS->>R: SET blacklist:{token} (TTL = remaining token life)
    AS-->>API: Success
    API-->>C: 200 { message: "Logged out" } + Clear Cookie
```

---

## 4. Data Model (Entity Relationship)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String email UK "unique"
        String name
        String googleId UK
        String avatar
        String displayName
        ObjectId tenantId FK "default workspace"
        String plan "free | pro"
        Boolean onboardingCompleted
        Date createdAt
        Date updatedAt
    }

    WORKSPACE {
        ObjectId _id PK
        String name
        String timezone "default: UTC"
        ObjectId createdBy FK
        String apiKey UK
        String plan "free | pro"
        Boolean digestEnabled "default: true"
        String digestDay "default: monday"
        Number digestHour "default: 9"
        Date archivedAt "null if active"
        Date createdAt
        Date updatedAt
    }

    WORKSPACE_MEMBER {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId userId FK
        String role "owner | admin | member"
        Date joinedAt
    }

    TASK {
        ObjectId _id PK
        ObjectId workspaceId FK
        String title
        String description
        String status "todo | in-progress | review | done"
        Number priority "manual 1-5"
        ObjectId createdBy FK
        ObjectId assignedTo FK
        Date dueDate
        Date completedAt
        Date archivedAt "soft delete"
        Date createdAt
        Date updatedAt
    }

    TASK_AI {
        ObjectId _id PK
        ObjectId taskId FK "embedded in task.ai"
        Number priority "AI score 0-10"
        String urgency "low | medium | high | critical"
        String deadline "suggested deadline"
        String category "bug | feature | chore | etc"
        String reasoning "AI explanation"
    }

    TASK_ATTACHMENT {
        ObjectId _id PK
        ObjectId taskId FK "embedded in task.attachments[]"
        String fileName
        String fileUrl "S3 presigned URL"
        Number fileSize "bytes"
        String mimeType
        Date uploadedAt
    }

    INVITE {
        ObjectId _id PK
        ObjectId workspaceId FK
        String token UK "ULID short token"
        ObjectId createdBy FK
        Date expiresAt
        ObjectId claimedBy FK "null until claimed"
        Date claimedAt
        Date createdAt
    }

    DIGEST {
        ObjectId _id PK
        ObjectId workspaceId FK
        Number week
        Number year
        String content "AI-generated summary"
        Number totalTasks
        Number completedTasks
        Number overdueTasks
        Number avgPriority
        Date generatedAt
    }

    %% Relationships
    USER ||--o{ WORKSPACE : "creates"
    USER ||--o{ WORKSPACE_MEMBER : "belongs to"
    WORKSPACE ||--o{ WORKSPACE_MEMBER : "has members"
    WORKSPACE ||--o{ TASK : "contains"
    WORKSPACE ||--o{ INVITE : "has invites"
    WORKSPACE ||--o{ DIGEST : "generates"
    USER ||--o{ TASK : "creates / assigned"
    USER ||--o{ INVITE : "creates / claims"
    TASK ||--|| TASK_AI : "has AI score"
    TASK ||--o{ TASK_ATTACHMENT : "has attachments"
```

---

## 5. Request Lifecycle & Real-Time Event Flow

```mermaid
flowchart TB
    subgraph ClientLayer["Client Layer"]
        HTTP["HTTP Request"]
        WS["WebSocket Connection"]
    end

    subgraph MiddlewarePipeline["Middleware Pipeline (in order)"]
        M1["1. Sentry Init<br/>(Error capture)"]
        M2["2. Helmet<br/>(Security headers)"]
        M3["3. CORS<br/>(Origin check)"]
        M4["4. JSON Parser<br/>(Body parsing)"]
        M5["5. Morgan → Winston<br/>(Request logging)"]
        M6["6. Rate Limiter<br/>(Redis counter check)"]
        M7["7. Auth Middleware<br/>(JWT verify → req.user)"]
        M8["8. Tenant Scope<br/>(Workspace isolation)"]
    end

    subgraph RoutingLayer["Route Handlers"]
        Router["Express Router<br/>/api/v1/*"]
        Controller["Controller<br/>(Zod validation + request handling)"]
    end

    subgraph BusinessLayer["Business Logic"]
        Service["Service Layer<br/>(Core logic + orchestration)"]
        AICall["AI Service<br/>(OpenRouter API call)"]
    end

    subgraph DataLayer["Data Access"]
        Model["Mongoose Model<br/>(Schema validation + query)"]
        Cache["Redis Cache<br/>(AI results, analytics, rate limits)"]
    end

    subgraph Persistence["Persistence"]
        Mongo[("MongoDB")]
        RedisDB[("Redis")]
    end

    subgraph RealTime["Real-Time Pipeline"]
        SocketIO["Socket.IO Server"]
        Room["Workspace Room<br/>workspace:{id}"]
        Event["Emit Event<br/>task:created | task:updated"]
        Broadcast["Broadcast to<br/>all room members"]
    end

    subgraph ErrorPipeline["Error Handling"]
        AppError["AppError<br/>(Custom error with code + status)"]
        ErrorMW["Error Middleware<br/>(Catch-all handler)"]
        SentryReport["Report to Sentry"]
        ErrorResponse["JSON Error Response<br/>{ error: { code, message, status } }"]
    end

    subgraph CronPipeline["Scheduled Jobs"]
        CronScheduler["node-cron<br/>(Monday 9 AM)"]
        DigestJob["Generate Weekly Digest"]
        EmailJob["Send Digest Email"]
    end

    %% Happy path
    HTTP --> M1 --> M2 --> M3 --> M4 --> M5 --> M6 --> M7 --> M8
    M8 --> Router --> Controller --> Service
    Service --> AICall
    Service --> Model --> Mongo
    Service --> Cache --> RedisDB
    AICall --> Cache

    %% Real-time events
    Service -->|"After save"| SocketIO
    SocketIO --> Room --> Event --> Broadcast
    WS <-.->|"Live updates"| SocketIO

    %% Error path
    Controller -.->|"throws"| AppError
    Service -.->|"throws"| AppError
    AppError --> ErrorMW --> SentryReport
    ErrorMW --> ErrorResponse

    %% Cron path
    CronScheduler --> DigestJob
    DigestJob --> Service
    DigestJob --> EmailJob

    %% Styling
    classDef middleware fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef service fill:#0ea5e9,stroke:#0284c7,color:#fff
    classDef data fill:#22c55e,stroke:#16a34a,color:#fff
    classDef error fill:#ef4444,stroke:#dc2626,color:#fff
    classDef realtime fill:#f59e0b,stroke:#d97706,color:#fff
    classDef cron fill:#8b5cf6,stroke:#7c3aed,color:#fff

    class M1,M2,M3,M4,M5,M6,M7,M8 middleware
    class Service,AICall,Controller service
    class Model,Cache,Mongo,RedisDB data
    class AppError,ErrorMW,SentryReport,ErrorResponse error
    class SocketIO,Room,Event,Broadcast realtime
    class CronScheduler,DigestJob,EmailJob cron
```

---

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph Developer["Developer Machine"]
        Code["Source Code"]
        DockerLocal["Docker Compose<br/>(Local Dev)"]
    end

    subgraph GitHub["GitHub"]
        Repo["taskpulse repo"]
        Actions["GitHub Actions CI"]
    end

    subgraph CI["CI Pipeline"]
        Lint["ESLint"]
        Test["Jest + Supertest"]
        Build["Docker Build"]
    end

    subgraph Railway["Railway (Production)"]
        RailwayApp["Node.js Service<br/>api.taskpulse.app"]
        RailwayMongo["MongoDB Plugin"]
        RailwayRedis["Redis Plugin"]
    end

    subgraph External["External Services"]
        GoogleOAuth["Google OAuth"]
        OpenRouterAI["OpenRouter AI"]
        StripeAPI["Stripe Payments"]
        AWSS3["AWS S3 Storage"]
        SentryMonitor["Sentry Monitoring"]
        ResendEmail["Resend Email"]
    end

    subgraph Monitoring["Observability"]
        Logs["Winston Logs<br/>(JSON format)"]
        SentryDash["Sentry Dashboard"]
        HealthEndpoint["Health Checks<br/>/health + /ready"]
    end

    %% Dev flow
    Code --> DockerLocal
    Code -->|"git push"| Repo
    Repo -->|"trigger"| Actions
    Actions --> Lint --> Test --> Build

    %% Deploy flow
    Build -->|"auto-deploy"| RailwayApp
    RailwayApp --> RailwayMongo
    RailwayApp --> RailwayRedis

    %% External connections
    RailwayApp -.-> GoogleOAuth
    RailwayApp -.-> OpenRouterAI
    RailwayApp -.-> StripeAPI
    RailwayApp -.-> AWSS3
    RailwayApp -.-> SentryMonitor
    RailwayApp -.-> ResendEmail

    %% Monitoring
    RailwayApp --> Logs
    RailwayApp --> SentryDash
    RailwayApp --> HealthEndpoint

    classDef dev fill:#6366f1,stroke:#4f46e5,color:#fff
    classDef ci fill:#f59e0b,stroke:#d97706,color:#fff
    classDef prod fill:#22c55e,stroke:#16a34a,color:#fff
    classDef ext fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef monitor fill:#0ea5e9,stroke:#0284c7,color:#fff

    class Code,DockerLocal dev
    class Lint,Test,Build,Actions ci
    class RailwayApp,RailwayMongo,RailwayRedis prod
    class GoogleOAuth,OpenRouterAI,StripeAPI,AWSS3,SentryMonitor,ResendEmail ext
    class Logs,SentryDash,HealthEndpoint monitor
```

---

## Diagram Index

| # | Diagram | What It Shows |
|---|---------|---------------|
| 1 | **High-Level System Architecture** | Every component, service, database, and external integration — the full bird's-eye view |
| 2 | **API Route Map** | All ~24 REST endpoints organized by module with HTTP methods |
| 3 | **Authentication Flow** | Step-by-step sequence: Login → Authenticated Request → Token Refresh → Logout |
| 4 | **Data Model (ER Diagram)** | All 8 MongoDB collections with fields, types, and relationships |
| 5 | **Request Lifecycle** | How a request flows through middleware → controller → service → DB → response, plus real-time events and error handling |
| 6 | **Deployment Architecture** | Dev → GitHub → CI/CD → Railway production, with all external service connections |
