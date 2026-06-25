const app = require('./app');
const { connectDB } = require('./shared/config/db');
const redis = require('./shared/config/redis');
const { initSocket } = require('./shared/config/socket');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    console.log('🚀 Starting TaskPulse server...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✓ MongoDB connected');

    // Connect to Redis
    await redis.ping();
    console.log('✓ Redis connected');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
    });

    // Initialize Socket.io
    initSocket(server);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await redis.quit();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();