const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const initDatabase = require('./config/init');

// Load env vars first
dotenv.config();

// Init DB
initDatabase();

// Init passport strategies (must happen after dotenv)
require('./config/passport');

const corsOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL]
  : [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: corsOrigins, methods: ['GET', 'POST'] },
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // JWT — no session needed

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));

// Static uploads
app.use('/uploads', express.static('uploads'));

// ─── Health / meta endpoints ──────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'LMS API' }));
app.get('/api/ping', (req, res) => res.type('text').send('pong'));
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);
app.get('/api/health/full', async (req, res) => {
  const start = Date.now();
  let dbOk = true;
  try {
    const { sequelize } = require('./models');
    await sequelize.query('SELECT 1');
  } catch {
    dbOk = false;
  }
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'reachable' : 'error',
    uptimeSec: Math.floor(process.uptime()),
    memoryRssMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    responseTimeMs: Date.now() - start,
    timestamp: new Date().toISOString(),
  });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Dynamic port binding ─────────────────────────────────────────────────────
const requestedPort = parseInt(process.env.PORT, 10) || 5000;
const candidates = [requestedPort, requestedPort + 1, requestedPort + 2];
let attempt = 0;

const startServer = (port) => {
  server.listen(port, '0.0.0.0', () => {
    const addr = server.address();
    console.log(`Server running on http://${addr.address}:${addr.port}`);
  });
};

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && attempt < candidates.length - 1) {
    attempt++;
    setTimeout(() => startServer(candidates[attempt]), 300);
  } else {
    console.error('Failed to bind server:', err);
    process.exit(1);
  }
});

startServer(candidates[0]);

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
