import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const assignments = await Assignment.find({})
      .populate('guestId', 'name mobileNumber')
      .populate('hotelId')
      .populate('cabId')
      .populate('pocId');
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('[GET /api/admin/assignments]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { guestId, hotelId, checkInDate, checkOutDate, roomNumber, cabId, pocId } = body as Record<string, unknown>;

  if (!guestId || typeof guestId !== 'string' || !guestId.trim())
    return NextResponse.json({ error: 'guestId is required' }, { status: 400 });

  try {
    await connectDB();

    const toObjectId = (value: unknown) => {
      if (value === null || value === undefined) return value as null | undefined;
      if (typeof value === 'string' && value.trim()) return new mongoose.Types.ObjectId(value.trim());
      return undefined;
    };

    const guestObjectId = new mongoose.Types.ObjectId((guestId as string).trim());

    // Build the $set payload — only include hotel date/room fields if a hotel is selected
    const setPayload: Record<string, unknown> = {
      guestId: guestObjectId,
      hotelId: toObjectId(hotelId),
      cabId: toObjectId(cabId),
      pocId: toObjectId(pocId),
      updatedAt: new Date(),
    };

    if (hotelId && typeof hotelId === 'string' && hotelId.trim()) {
      if (checkInDate) setPayload.checkInDate = new Date(checkInDate as string);
      if (checkOutDate) setPayload.checkOutDate = new Date(checkOutDate as string);
      if (roomNumber && typeof roomNumber === 'string' && roomNumber.trim()) {
        setPayload.roomNumber = (roomNumber as string).trim();
      }
    } else {
      // Clearing hotel — also clear the hotel-specific fields
      setPayload.checkInDate = null;
      setPayload.checkOutDate = null;
      setPayload.roomNumber = null;
    }

    const assignment = await Assignment.findOneAndUpdate(
      { guestId: guestObjectId },
      { $set: setPayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error('[POST /api/admin/assignments]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
