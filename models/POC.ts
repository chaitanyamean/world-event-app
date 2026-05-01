import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPOC extends Document {
  name: string;
  mobile: string;
  createdAt: Date;
}

const POCSchema = new Schema<IPOC>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Use Mongoose model caching to avoid re-registration errors in Next.js
// serverless environments where modules may be re-evaluated between requests
const POC: Model<IPOC> =
  (mongoose.models.POC as Model<IPOC>) ||
  mongoose.model<IPOC>('POC', POCSchema);

export default POC;
