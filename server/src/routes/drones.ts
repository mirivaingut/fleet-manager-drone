import { Router } from 'express';
import Joi from 'joi';
import Drone from '../models/Drone';
import telemetryRouter from './telemetry';
import { getCache, setCache } from '../cache';
import Telemetry from '../models/Telemetry';

const router = Router();

const droneSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().min(1).required(),
  status: Joi.string().valid('idle', 'flying', 'offline').default('idle'),
});

const droneUpdateSchema = Joi.object({
  name: Joi.string().min(1),
  type: Joi.string().min(1),
  status: Joi.string().valid('idle', 'flying', 'offline'),
}).min(1); // at least one field

// simple CRUD for drones
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'drones:list';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const list = await Drone.find();
    await setCache(cacheKey, JSON.stringify(list), 300); // 5 min
    res.json(list);
  } catch (err) {
    console.error('Get drones error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { error, value } = droneSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const drone = new Drone(value);
    await drone.save();
    res.status(201).json(drone);
  } catch (err) {
    console.error('Create drone error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analytics endpoint for all drones
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await Telemetry.aggregate([
      {
        $group: {
          _id: '$droneId',
          avgSpeed: { $avg: '$speed' },
          avgBattery: { $avg: '$battery' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'drones',
          localField: '_id',
          foreignField: '_id',
          as: 'drone',
        },
      },
      {
        $unwind: '$drone',
      },
      {
        $project: {
          droneName: '$drone.name',
          avgSpeed: 1,
          avgBattery: 1,
          count: 1,
        },
      },
    ]);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to get analytics.', error: message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const d = await Drone.findById(req.params.id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (err) {
    console.error('Get drone error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  if ((req as any).user.role !== 'admin') return res.status(403).json({ message: 'Admin required' });
  try {
    const { error, value } = droneUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const d = await Drone.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!d) return res.status(404).json({ message: 'Not found' });
    res.json(d);
  } catch (err) {
    console.error('Update drone error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  if ((req as any).user.role !== 'admin') return res.status(403).json({ message: 'Admin required' });
  try {
    await Drone.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Delete drone error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// mount telemetry sub-route
router.use('/:id/telemetry', telemetryRouter);

export default router;
