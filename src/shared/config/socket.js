const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // A user can join specific workspace rooms
    socket.on('join_workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
    });

    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      console.log(`Socket ${socket.id} left workspace ${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
