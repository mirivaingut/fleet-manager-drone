import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server as IOServer } from 'socket.io';

import authRoutes from './routes/auth';
import droneRoutes from './routes/drones';
import authMiddleware from './middleware/auth';

dotenv.config();

const app = express();
const server = http.createServer(app);
import { initIO } from './io';
const io = initIO(server);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// protect drone routes with simple JWT middleware
app.use('/api/drones', authMiddleware, droneRoutes);

// socket handling (subscribe/unsubscribe for telemetry)
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('subscribe', (msg) => {
    if (msg.droneId) {
      socket.join(`drone:${msg.droneId}`);
    }
  });
  socket.on('unsubscribe', (msg) => {
    if (msg.droneId) {
      socket.leave(`drone:${msg.droneId}`);
    }
  });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleet')
  .then(async () => {
    console.log('Connected to MongoDB');
    // ensure default admin exists
    const User = (await import('./models/User')).default;
    const bcrypt = await import('bcryptjs');
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (!existing) {
      const hash = await bcrypt.hash('password', 10);
      await new User({ name: 'Admin', email: 'admin@example.com', passwordHash: hash, role: 'admin' }).save();
      console.log('Created default admin (admin@example.com / password)');
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
  });
