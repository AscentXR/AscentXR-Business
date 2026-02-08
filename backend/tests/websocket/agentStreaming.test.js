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

    socket.on('agent:subscribe', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('agent:unsubscribe', (taskId) => {
      socket.leave(`task:${taskId}`);
    });
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

describe('Agent Streaming WebSocket', () => {
  let client;

  afterEach(() => {
    if (client && client.connected) client.disconnect();
  });

  // 1. Client receives task status updates via WebSocket
  it('should receive task status updates', (done) => {
    client = connect(makeToken());

    client.on('connect', () => {
      client.emit('agent:subscribe', 'task-123');

      // Simulate server emitting a task update after a short delay
      setTimeout(() => {
        io.to('task:task-123').emit('agent:task:stream', {
          id: 'task-123',
          status: 'running',
          progress: 50,
        });
      }, 50);
    });

    client.on('agent:task:stream', (data) => {
      expect(data.id).toBe('task-123');
      expect(data.status).toBe('running');
      expect(data.progress).toBe(50);
      done();
    });
  });

  // 2. Streaming text chunks arrive in order
  it('should receive streaming text chunks in order', (done) => {
    client = connect(makeToken());
    const receivedChunks = [];

    client.on('connect', () => {
      client.emit('agent:subscribe', 'task-456');

      // Emit 5 chunks in sequence
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          io.to('task:task-456').emit('agent:task:stream', {
            id: 'task-456',
            status: 'streaming',
            chunk: `Chunk ${i}`,
            chunkIndex: i,
          });
        }
      }, 50);
    });

    client.on('agent:task:stream', (data) => {
      receivedChunks.push(data);
      if (receivedChunks.length === 5) {
        for (let i = 0; i < 5; i++) {
          expect(receivedChunks[i].chunk).toBe(`Chunk ${i}`);
          expect(receivedChunks[i].chunkIndex).toBe(i);
        }
        done();
      }
    });
  });

  // 3. Task completion event includes deliverable
  it('should include deliverable on task completion', (done) => {
    client = connect(makeToken());

    client.on('connect', () => {
      client.emit('agent:subscribe', 'task-789');

      setTimeout(() => {
        io.to('task:task-789').emit('agent:task:stream', {
          id: 'task-789',
          status: 'completed',
          deliverable: {
            type: 'linkedin_post',
            content: 'Here is your post content...',
          },
          execution_time_ms: 3500,
        });
      }, 50);
    });

    client.on('agent:task:stream', (data) => {
      if (data.status === 'completed') {
        expect(data.deliverable).toBeDefined();
        expect(data.deliverable.type).toBe('linkedin_post');
        expect(data.deliverable.content).toContain('post content');
        expect(data.execution_time_ms).toBe(3500);
        done();
      }
    });
  });

  // 4. Client reconnection resumes from last event
  it('should allow reconnection and re-subscribe to task room', (done) => {
    const token = makeToken();
    client = connect(token);

    client.on('connect', () => {
      client.emit('agent:subscribe', 'task-reconnect');

      // Disconnect then reconnect
      client.disconnect();

      const client2 = connect(token);
      client2.on('connect', () => {
        client2.emit('agent:subscribe', 'task-reconnect');

        setTimeout(() => {
          io.to('task:task-reconnect').emit('agent:task:stream', {
            id: 'task-reconnect',
            status: 'running',
            chunk: 'After reconnect',
            chunkIndex: 5,
          });
        }, 50);
      });

      client2.on('agent:task:stream', (data) => {
        expect(data.id).toBe('task-reconnect');
        expect(data.chunk).toBe('After reconnect');
        expect(data.chunkIndex).toBe(5);
        client2.disconnect();
        done();
      });
    });
  });

  // 5. Unauthorized client is rejected
  it('should reject client with no token', (done) => {
    const badClient = ioClient(`http://localhost:${port}`, {
      auth: {},
      transports: ['websocket'],
      forceNew: true,
    });

    badClient.on('connect_error', (err) => {
      expect(err.message).toContain('Authentication required');
      badClient.disconnect();
      done();
    });

    // Should not connect
    badClient.on('connect', () => {
      badClient.disconnect();
      done(new Error('Should not have connected without a token'));
    });
  });
});
