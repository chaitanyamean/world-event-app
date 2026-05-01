import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHotel extends Document {
  hotelName: string;
  address: string;
  createdAt: Date;
}

const HotelSchema = new Schema<IHotel>(
  {
    hotelName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Hotel: Model<IHotel> =
  (mongoose.models.Hotel as Model<IHotel>) ||
  mongoose.model<IHotel>('Hotel', HotelSchema);

export default Hotel;
