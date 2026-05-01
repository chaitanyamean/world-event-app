import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import Hotel from '@/models/Hotel';
import Cab from '@/models/Cab';
import POC from '@/models/POC';

/**
 * GET /api/admin/assignments/init
 *
 * Returns all data needed to render the Manage Assignments page in a single
 * request: guests, hotels, cabs, pocs, and assignments. All five queries run
 * in parallel after a single DB connection, replacing the previous five
 * sequential round-trips from the client.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();

    const [guests, hotels, cabs, pocs, assignments] = await Promise.all([
      User.find({ role: 'guest' }).select('name mobileNumber').lean(),
      Hotel.find({}).lean(),
      Cab.find({}).lean(),
      POC.find({}).lean(),
      Assignment.find({})
        .populate('guestId', 'name mobileNumber')
        .populate('hotelId')
        .populate('cabId')
        .populate('pocId')
        .lean(),
    ]);

    return NextResponse.json({ guests, hotels, cabs, pocs, assignments });
  } catch (error) {
    console.error('[GET /api/admin/assignments/init]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
