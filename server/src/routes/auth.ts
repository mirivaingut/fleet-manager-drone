import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import User from '../models/User';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const { name, email, password } = value;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hash, role: 'operator' });
    await user.save();

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Registered',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export default router;
