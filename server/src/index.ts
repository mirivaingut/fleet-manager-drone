import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import winston from 'winston';

import authRoutes from './routes/auth';
import droneRoutes from './routes/drones';
import authMiddleware from './middleware/auth';
import { connectRedis } from './cache';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI environment variable is required');
  process.exit(1);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

const app = express();
const server = http.createServer(app);
import { initIO } from './io';
const io = initIO(server);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check DB connection
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);

// protect drone routes with simple JWT middleware
app.use('/api/drones', authMiddleware, droneRoutes);

// socket handling (subscribe/unsubscribe for telemetry)
io.on('connection', (socket) => {
  logger.info('socket connected', { socketId: socket.id });
  socket.on('subscribe', (msg) => {
    if (msg.droneId) {
      socket.join(`drone:${msg.droneId}`);
      logger.info('socket subscribed', { socketId: socket.id, droneId: msg.droneId });
    }
  });
  socket.on('unsubscribe', (msg) => {
    if (msg.droneId) {
      socket.leave(`drone:${msg.droneId}`);
      logger.info('socket unsubscribed', { socketId: socket.id, droneId: msg.droneId });
    }
  });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleet')
  .then(async () => {
    logger.info('Connected to MongoDB');
    try {
      await connectRedis();
      logger.info('Connected to Redis');
    } catch (error) {
      logger.warn('Redis connection failed, continuing without caching', { error });
    }
    // ensure default admin exists
    const User = (await import('./models/User')).default;
    const bcrypt = await import('bcryptjs');
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (!existing) {
      const hash = await bcrypt.hash('password', 10);
      await new User({ name: 'Admin', email: 'admin@example.com', passwordHash: hash, role: 'admin' }).save();
      logger.info('Created default admin (admin@example.com / password)');
    }

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Mongo connection error', { error: err });
  });
