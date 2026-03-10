import { Router } from 'express';
import { Router } from 'express';
import Drone from '../models/Drone';
import telemetryRouter from './telemetry';

const router = Router();

// simple CRUD for drones
router.get('/', async (req, res) => {
  const list = await Drone.find();
  res.json(list);
});

router.post('/', async (req, res) => {
  const { name, type, status } = req.body;
  const drone = new Drone({ name, type, status });
  await drone.save();
  res.status(201).json(drone);
});

router.get('/:id', async (req, res) => {
  const d = await Drone.findById(req.params.id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
});

router.put('/:id', async (req, res) => {
  const d = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!d) return res.status(404).json({ message: 'Not found' });
  res.json(d);
});

router.delete('/:id', async (req, res) => {
  await Drone.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// mount telemetry sub-route
router.use('/:id/telemetry', telemetryRouter);

export default router;
