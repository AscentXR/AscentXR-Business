const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

let io = null;

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`WebSocket connected: ${user.username} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.username}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Subscribe to agent task updates
    socket.on('agent:subscribe', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('agent:unsubscribe', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected: ${user.username} (${socket.id})`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

// Emit to all connected clients
function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

// Emit to a specific user
function emitToUser(username, event, data) {
  if (io) {
    io.to(`user:${username}`).emit(event, data);
  }
}

// Emit to a specific task room (for streaming)
function emitToTask(taskId, event, data) {
  if (io) {
    io.to(`task:${taskId}`).emit(event, data);
  }
}

// Emit notification to all users
function emitNotification(notification) {
  if (io) {
    io.emit('notification', notification);
  }
}

// Emit agent task update
function emitTaskUpdate(task) {
  if (io) {
    io.emit('agent:task:update', task);
    if (task.id) {
      io.to(`task:${task.id}`).emit('agent:task:stream', task);
    }
  }
}

module.exports = {
  initWebSocket,
  getIO,
  broadcast,
  emitToUser,
  emitToTask,
  emitNotification,
  emitTaskUpdate,
};
