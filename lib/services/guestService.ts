import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

export class ForbiddenError extends Error {
  status: 403 = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function getGuestDashboardData(guestId: string, sessionUserId: string) {
  if (guestId !== sessionUserId) throw new ForbiddenError();

  await connectDB();

  return Assignment.findOne({ guestId: new mongoose.Types.ObjectId(guestId) })
    .populate('hotelId')
    .populate('cabId')
    .populate('pocId');
}
