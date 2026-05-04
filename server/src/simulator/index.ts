import mongoose from 'mongoose';
import Drone from '../models/Drone';
import Telemetry from '../models/Telemetry';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// realistic interval-based simulator that sends plausible telemetry updates

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/fleet';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function randomHeading() {
  return Math.random() * Math.PI * 2;
}

async function main() {
  await mongoose.connect(MONGO);
  console.log('Simulator connected to Mongo');

  const api = axios.create({ baseURL: process.env.SERVER_URL || 'http://localhost:4000/api' });
  const token = jwt.sign({ id: 'simulator', role: 'system' }, process.env.JWT_SECRET || 'secret');
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const state: Record<string, { lat: number; lon: number; battery: number; speed: number; heading: number }> = {};

  while (true) {
    const drones = await Drone.find();
    for (const d of drones) {
      if (!state[d._id.toString()]) {
        const lastTelemetry = await Telemetry.findOne({ droneId: d._id }).sort({ timestamp: -1 });
        if (lastTelemetry) {
          state[d._id.toString()] = {
            lat: lastTelemetry.location.lat,
            lon: lastTelemetry.location.lon,
            battery: lastTelemetry.battery ?? 80,
            speed: Math.max(0, Math.min(12, lastTelemetry.speed)),
            heading: randomHeading(),
          };
        } else {
          state[d._id.toString()] = {
            lat: 32.0853 + (Math.random() - 0.5) * 0.02,
            lon: 34.7818 + (Math.random() - 0.5) * 0.02,
            battery: 80 + Math.floor(Math.random() * 20),
            speed: 2 + Math.random() * 4,
            heading: randomHeading(),
          };
        }
      }

      const entry = state[d._id.toString()];

      const speedTarget = d.status === 'flying' ? 5 + Math.random() * 8 : Math.random() * 1.5;
      entry.speed = entry.speed + (speedTarget - entry.speed) * 0.2;
      entry.heading += (Math.random() - 0.5) * 0.4;
      const distance = entry.speed * 0.00005; // small geographic change per tick
      entry.lat = clamp(entry.lat + Math.sin(entry.heading) * distance, -90, 90);
      entry.lon = clamp(entry.lon + Math.cos(entry.heading) * distance, -180, 180);

      const batteryDrain = d.status === 'flying' ? 1 + Math.random() * 1.5 : Math.random() * 0.3;
      entry.battery = clamp(entry.battery - batteryDrain, 0, 100);

      const payload = {
        location: { lat: parseFloat(entry.lat.toFixed(6)), lon: parseFloat(entry.lon.toFixed(6)) },
        speed: parseFloat(entry.speed.toFixed(1)),
        battery: Math.round(entry.battery),
      };

      try {
        await api.post(`/drones/${d._id}/telemetry`, payload);
        console.log(`posted telemetry for ${d.name}`, payload);
      } catch (e) {
        console.error('failed to post telemetry', e);
      }
    }

    await sleep(5000);
  }
}

main().catch(console.error);
