import mongoose from 'mongoose';
import Drone from '../models/Drone';
// Telemetry is no longer used directly; server API handles saving
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// simple interval-based simulator that writes random telemetry for each drone

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/fleet';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await mongoose.connect(MONGO);
  console.log('Simulator connected to Mongo');

  // create an axios instance for the server API; we post telemetry instead of saving directly
  // create api client with JWT auth so middleware accepts it
  const api = axios.create({ baseURL: process.env.SERVER_URL || 'http://localhost:4000/api' });
  // sign a simple token using server secret
  const token = jwt.sign({ id: 'simulator', role: 'system' }, process.env.JWT_SECRET || 'secret');
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  while (true) {
    const drones = await Drone.find();
    for (const d of drones) {
      const lat = 35 + Math.random();
      const lon = 32 + Math.random();
      const speed = Math.random() * 20;
      const battery = Math.floor(Math.random() * 100);
      try {
        await api.post(`/drones/${d._id}/telemetry`, {
          location: { lat, lon },
          speed,
          battery,
        });
        console.log(`posted telemetry for ${d.name}`);
      } catch (e) {
        console.error('failed to post telemetry', e);
      }
    }
    await sleep(5000);
  }
}

main().catch(console.error);
