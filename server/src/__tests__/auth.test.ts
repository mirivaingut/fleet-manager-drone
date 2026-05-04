import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/auth';
import User from '../models/User';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registered');
  });

  it('should login with valid credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should reject invalid login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('should validate input', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: '', email: 'invalid', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation error');
  });
});