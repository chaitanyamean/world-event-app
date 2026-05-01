import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  mobileNumber: string;
  passwordHash: string;
  role: 'admin' | 'guest';
  company?: string;
  designation?: string;
  email?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      required: true,
    },
    company: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Ensure the unique index on mobileNumber is created
UserSchema.index({ mobileNumber: 1 }, { unique: true });

// Use Mongoose model caching to avoid re-registration errors in Next.js
// serverless environments where modules may be re-evaluated between requests
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
