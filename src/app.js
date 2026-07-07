const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const passport = require('passport');

const { logger, morganFormat } = require('./shared/utils/logger');
const errorHandler = require('./shared/utils/errorHandler');
const AppError = require('./shared/utils/AppError');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const workspaceRoutes = require('./modules/workspaces/workspaces.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const invitesRoutes = require('./modules/invites/invites.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const projectsRoutes = require('./modules/projects/projects.routes');
const viewsRoutes = require('./modules/views/views.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const app = express();

// ─── Middleware Pipeline ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true  // Required for cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(morganFormat, { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Initialize Passport
require('./shared/config/passport');
app.use(passport.initialize());

// ─── Swagger Documentation ─────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskPulse API',
      version: '1.0.0',
      description: 'AI-powered task management SaaS'
    },
    servers: [
      { url: `${process.env.API_URL || 'http://localhost:3000'}/api/v1`, description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/modules/**/*.routes.js']
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health Checks ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (req, res, next) => {
  try {
    const { mongoose } = require('./shared/config/db');
    const redis = require('./shared/config/redis');
    
    await mongoose.connection.db.admin().ping();
    await redis.ping();
    
    res.json({ status: 'ready', database: 'connected', redis: 'connected' });
  } catch (error) {
    next(new AppError('Service not ready', 503));
  }
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/invites', invitesRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/views', viewsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// ─── 404 Catch-All ──────────────────────────────────────────────────
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ─── Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;