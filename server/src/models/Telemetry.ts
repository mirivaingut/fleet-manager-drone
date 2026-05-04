import { Schema, model, Document, Types } from 'mongoose';

interface ITelemetry extends Document {
  droneId: Types.ObjectId;
  timestamp: Date;
  location: { lat: number; lon: number };
  speed: number;
  battery?: number;
  extra?: Record<string, any>;
  sensors?: Record<string, any>;
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
    sensors: Schema.Types.Mixed, // additional sensor data
  },
  { timestamps: true }
);

// Add index for efficient queries
telemetrySchema.index({ droneId: 1, timestamp: -1 });

export default model<ITelemetry>('Telemetry', telemetrySchema);
