const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');

const JWT_SECRET = 'test-secret';
const TEST_USER = { username: 'jim', name: 'Jim', role: 'CEO' };

function makeToken(payload = TEST_USER) {
  return jwt.sign(payload, JWT_SECRET);
}

let httpServer, io, port;

beforeAll((done) => {
  const app = express();
  httpServer = http.createServer(app);

  io = new Server(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware matching production websocket.js
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.username}`);
    socket.join(`role:${socket.user.role}`);
  });

  httpServer.listen(0, () => {
    port = httpServer.address().port;
    done();
  });
});

afterAll((done) => {
  io.close();
  httpServer.close(done);
});

function connect(token) {
  return ioClient(`http://localhost:${port}`, {
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
  });
}

describe('Notification WebSocket', () => {
  // 1. New notification pushes to connected clients
  it('should push new notification to connected clients', (done) => {
    const client = connect(makeToken());

    client.on('connect', () => {
      setTimeout(() => {
        io.emit('notification', {
          id: 'notif-ws-1',
          type: 'renewal_due',
          severity: 'high',
          title: 'Renewal due in 30 days',
          message: 'IPS district contract renewing soon',
          section: 'customer_success',
          action_url: '/customer-success',
          created_at: new Date().toISOString(),
        });
      }, 50);
    });

    client.on('notification', (data) => {
      expect(data.id).toBe('notif-ws-1');
      expect(data.type).toBe('renewal_due');
      expect(data.severity).toBe('high');
      expect(data.title).toContain('Renewal');
      client.disconnect();
      done();
    });
  });

  // 2. Only authenticated clients receive notifications
  it('should reject unauthenticated client before notifications', (done) => {
    const badClient = ioClient(`http://localhost:${port}`, {
      auth: { token: 'invalid-jwt-token' },
      transports: ['websocket'],
      forceNew: true,
    });

    badClient.on('connect_error', (err) => {
      expect(err.message).toContain('Invalid token');
      badClient.disconnect();
      done();
    });

    badClient.on('connect', () => {
      badClient.disconnect();
      done(new Error('Should not have connected with invalid token'));
    });
  });

  // 3. Notification includes section and action URL
  it('should include section and action_url in notification payload', (done) => {
    const client = connect(makeToken());

    client.on('connect', () => {
      setTimeout(() => {
        io.emit('notification', {
          id: 'notif-ws-2',
          type: 'invoice_overdue',
          severity: 'critical',
          title: 'Invoice overdue: INV-202602-005',
          message: '$25,000 payment past due by 10 days',
          section: 'finance',
          action_url: '/finance',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }, 50);
    });

    client.on('notification', (data) => {
      expect(data.section).toBe('finance');
      expect(data.action_url).toBe('/finance');
      expect(data.severity).toBe('critical');
      expect(data.is_read).toBe(false);
      expect(data.created_at).toBeDefined();
      client.disconnect();
      done();
    });
  });
});
