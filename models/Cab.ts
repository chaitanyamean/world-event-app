import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICab extends Document {
  driverName: string;
  driverMobile: string;
  vehicleNumber: string;
  // Optional fields
  pickupTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
  createdAt: Date;
}

const CabSchema = new Schema<ICab>(
  {
    driverName: {
      type: String,
      required: true,
      trim: true,
    },
    driverMobile: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    pickupTime: {
      type: String,
      trim: true,
    },
    pickupLocation: {
      type: String,
      trim: true,
    },
    dropLocation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Use Mongoose model caching to avoid re-registration errors in Next.js
// serverless environments where modules may be re-evaluated between requests
const Cab: Model<ICab> =
  (mongoose.models.Cab as Model<ICab>) ||
  mongoose.model<ICab>('Cab', CabSchema);

export default Cab;
