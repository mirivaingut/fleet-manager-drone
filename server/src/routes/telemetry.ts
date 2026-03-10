import { Router } from 'express';
import Telemetry from '../models/Telemetry';

const router = Router({ mergeParams: true });

// GET /api/drones/:id/telemetry
router.get('/', async (req, res) => {
  const { id } = req.params;
  const list = await Telemetry.find({ droneId: id }).sort({ timestamp: -1 }).limit(100);
  res.json(list);
});

// POST /api/drones/:id/telemetry
router.post('/', async (req, res) => {
  const { id } = req.params;
  const { location, speed, battery, extra } = req.body;
  const t = new Telemetry({ droneId: id, location, speed, battery, extra });
  await t.save();

  try {
    const { getIO } = await import('../io');
    const io = getIO();
    io.to(`drone:${id}`).emit('telemetry:update', { droneId: id, data: t });
  } catch (e) {
    console.warn('socket.io not available yet', e);
  }

  res.status(201).json(t);
});

export default router;
