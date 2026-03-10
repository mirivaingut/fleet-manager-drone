import { Schema, model, Document } from 'mongoose';

interface ITelemetry extends Document {
  droneId: string;
  timestamp: Date;
  location: { lat: number; lon: number };
  speed: number;
  battery?: number;
  extra?: Record<string, any>;
}

const telemetrySchema = new Schema<ITelemetry>(
  {
    droneId: { type: Schema.Types.ObjectId, ref: 'Drone', required: true },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    speed: { type: Number, required: true },
    battery: Number,
    extra: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default model<ITelemetry>('Telemetry', telemetrySchema);
