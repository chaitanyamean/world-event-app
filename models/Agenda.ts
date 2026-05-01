import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAgenda extends Document {
  imageDataUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  updatedAt: Date;
}

const AgendaSchema = new Schema<IAgenda>(
  {
    imageDataUri: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp'],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Use Mongoose model caching to avoid re-registration errors in Next.js
// serverless environments where modules may be re-evaluated between requests
const Agenda: Model<IAgenda> =
  (mongoose.models.Agenda as Model<IAgenda>) ||
  mongoose.model<IAgenda>('Agenda', AgendaSchema);

export default Agenda;
