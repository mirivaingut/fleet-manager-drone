import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'operator';
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'operator'], default: 'operator' },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);
