const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE']
	}
});

// Socket.io setup: broadcast complaint updates
io.on('connection', socket => {
	// Keep socket for room-based updates in future
	socket.on('disconnect', () => {});
});

app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Mongo connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swms';
mongoose
	.connect(mongoUri)
	.then(() => console.log('MongoDB connected'))
	.catch(err => {
		console.error('MongoDB connection error', err);
		process.exit(1);
	});

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const taskRoutes = require('./routes/tasks');
const binRoutes = require('./routes/bins');
const engagementRoutes = require('./routes/engagement');
const aiRoutes = require('./routes/ai');
const routeoptRoutes = require('./routes/routeopt');
const analyticsRoutes = require('./routes/analytics');
const blockchainRoutes = require('./routes/blockchain');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/routes', routeoptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/blockchain', blockchainRoutes);

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
	console.log(`Server running on port ${port}`);
});


