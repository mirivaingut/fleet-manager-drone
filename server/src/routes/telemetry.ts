import { Router } from 'express';
import Joi from 'joi';
import Telemetry from '../models/Telemetry';

const router = Router({ mergeParams: true });

const telemetrySchema = Joi.object({
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
  }).required(),
  speed: Joi.number().min(0).required(),
  battery: Joi.number().min(0).max(100),
  extra: Joi.object().optional(),
  sensors: Joi.object().optional(), // additional sensor data
});

// GET /api/drones/:id/telemetry
router.get('/', async (req, res) => {
  const { id } = req.params as { id: string };
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const skip = (page - 1) * limit;
  try {
    const list = await Telemetry.find({ droneId: id }).sort({ timestamp: -1 }).skip(skip).limit(limit);
    if (!list || list.length === 0) {
      return res.status(404).json({ message: 'No telemetry data found for this drone.' });
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching telemetry data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to fetch telemetry data.', error: message });
  }
});

// POST /api/drones/:id/telemetry
router.post('/', async (req, res) => {
  const { id } = req.params as { id: string };
  try {
    const { error, value } = telemetrySchema.validate(req.body);
    if (error) return res.status(400).json({ message: 'Validation error', details: error.details });

    const t = new Telemetry({ droneId: id, ...value });
    await t.save();

    try {
      const { getIO } = await import('../io');
      const io = getIO();
      io.to(`drone:${id}`).emit('telemetry:update', { droneId: id, data: t });
    } catch (e) {
      console.warn('socket.io not available yet', e);
    }

    res.status(201).json(t);
  } catch (error) {
    console.error('Error posting telemetry data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Failed to post telemetry data.', error: message });
  }
});

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

export default router;
