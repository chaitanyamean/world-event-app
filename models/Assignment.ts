import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IAssignment extends Document {
  guestId: Types.ObjectId;      // ref: User, unique index
  hotelId?: Types.ObjectId;     // ref: Hotel
  checkInDate?: Date;           // guest-specific check-in
  checkOutDate?: Date;          // guest-specific check-out
  roomNumber?: string;          // guest-specific room
  cabId?: Types.ObjectId;       // ref: Cab
  pocId?: Types.ObjectId;       // ref: POC
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: false },
    checkInDate: { type: Date, required: false },
    checkOutDate: { type: Date, required: false },
    roomNumber: { type: String, trim: true, required: false },
    cabId: { type: Schema.Types.ObjectId, ref: 'Cab', required: false },
    pocId: { type: Schema.Types.ObjectId, ref: 'POC', required: false },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const Assignment: Model<IAssignment> =
  (mongoose.models.Assignment as Model<IAssignment>) ||
  mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
