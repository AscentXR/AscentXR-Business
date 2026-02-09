const { Server } = require('socket.io');

let io = null;

function initWebSocket(server) {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(o => o.trim());

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const { getAuth } = require('./config/firebase');
      const decoded = await getAuth().verifyIdToken(token, true);
      socket.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role: decoded.role || 'viewer'
      };
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`WebSocket connected: ${user.email} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.email}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Track rooms per socket for limits
    let taskRoomCount = 0;
    const MAX_TASK_ROOMS = 10;

    // Subscribe to agent task updates
    socket.on('agent:subscribe', (taskId) => {
      if (typeof taskId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(taskId) || taskId.length > 100) {
        return;
      }
      if (taskRoomCount >= MAX_TASK_ROOMS) {
        return;
      }
      taskRoomCount++;
      socket.join(`task:${taskId}`);
    });

    socket.on('agent:unsubscribe', (taskId) => {
      if (typeof taskId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(taskId) || taskId.length > 100) {
        return;
      }
      taskRoomCount = Math.max(0, taskRoomCount - 1);
      socket.leave(`task:${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket disconnected: ${user.email} (${socket.id})`);
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
function emitToUser(email, event, data) {
  if (io) {
    io.to(`user:${email}`).emit(event, data);
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
    // Also emit team-scoped update if task has team_id
    if (task.team_id) {
      io.emit('team:task:update', task);
    }
  }
}

// Emit daily briefing ready event to admin users
function emitDailyBriefingReady(data) {
  if (io) {
    io.to('role:admin').emit('daily:briefing:ready', data);
  }
}

// Emit backup progress to admin users
function emitBackupProgress(data) {
  if (io) {
    io.to('role:admin').emit('backup:progress', data);
  }
}

// Emit restore progress to admin users
function emitRestoreProgress(data) {
  if (io) {
    io.to('role:admin').emit('restore:progress', data);
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
  emitDailyBriefingReady,
  emitBackupProgress,
  emitRestoreProgress,
};
