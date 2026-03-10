import { Schema, model, Document } from 'mongoose';

interface IDrone extends Document {
  name: string;
  type: string;
  status: 'idle' | 'flying' | 'offline';
  lastSeen: Date;
  meta?: Record<string, any>;
}

const droneSchema = new Schema<IDrone>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['idle', 'flying', 'offline'], default: 'idle' },
    lastSeen: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model<IDrone>('Drone', droneSchema);
