require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', credentials: true },
});

// =========================
// ✅ MongoDB Connection
// =========================
async function connectDb() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
  }
}

// =========================
// ✅ Safe route loader
// =========================
const safeImport = (path) => {
  try {
    return require(path);
  } catch (err) {
    const r = express.Router();
    r.get('/', (_, res) =>
      res.status(501).json({ error: `Route ${path} not implemented` })
    );
    return r;
  }
};

// =========================
// ✅ Middleware setup
// =========================
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// =========================
// ✅ Routes
// =========================
app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', safeImport('./routes/auth'));
// Complaints route exports a factory that needs io
const complaintsModule = safeImport('./routes/complaints');
app.use(
  '/api/complaints',
  typeof complaintsModule === 'function' ? complaintsModule(io) : complaintsModule
);
app.use('/api/bins', safeImport('./routes/bins'));
app.use('/api/ai', safeImport('./routes/ai'));
app.use('/api/upload', safeImport('./routes/upload'));
app.use('/api/leaderboard', safeImport('./routes/leaderboard'));
app.use('/api/teams', safeImport('./routes/teams'));
app.use('/api/profile', safeImport('./routes/profile'));

// =========================
// ✅ Socket.io setup
// =========================
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('disconnect', () =>
    console.log('🔴 Socket disconnected:', socket.id)
  );
});

// =========================
// ✅ Start server
// =========================
const port = process.env.PORT || 4001;

connectDb().then(() => {
  server.listen(port, () => {
    console.log(`✅ API listening on :${port}`);
  });
});
