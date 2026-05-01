import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Cab from '@/models/Cab';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { driverName, driverMobile, vehicleNumber, pickupTime, pickupLocation, dropLocation } = body as Record<string, unknown>;
  if (!driverName || typeof driverName !== 'string' || !driverName.trim())
    return NextResponse.json({ error: 'driverName is required' }, { status: 400 });
  if (!driverMobile || typeof driverMobile !== 'string' || !driverMobile.trim())
    return NextResponse.json({ error: 'driverMobile is required' }, { status: 400 });
  if (!vehicleNumber || typeof vehicleNumber !== 'string' || !vehicleNumber.trim())
    return NextResponse.json({ error: 'vehicleNumber is required' }, { status: 400 });

  try {
    await connectDB();
    const update: Record<string, unknown> = {
      driverName: (driverName as string).trim(),
      driverMobile: (driverMobile as string).trim(),
      vehicleNumber: (vehicleNumber as string).trim(),
    };
    const unset: Record<string, string> = {};
    if (pickupTime && typeof pickupTime === 'string' && pickupTime.trim()) update.pickupTime = pickupTime.trim();
    else unset.pickupTime = '';
    if (pickupLocation && typeof pickupLocation === 'string' && pickupLocation.trim()) update.pickupLocation = pickupLocation.trim();
    else unset.pickupLocation = '';
    if (dropLocation && typeof dropLocation === 'string' && dropLocation.trim()) update.dropLocation = dropLocation.trim();
    else unset.dropLocation = '';

    const cab = await Cab.findByIdAndUpdate(
      params.id,
      { $set: update, ...(Object.keys(unset).length > 0 && { $unset: unset }) },
      { new: true }
    );
    if (!cab) return NextResponse.json({ error: 'Cab not found' }, { status: 404 });
    return NextResponse.json(cab);
  } catch (error) {
    console.error('[PUT /api/admin/cabs/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const cab = await Cab.findByIdAndDelete(params.id);
    if (!cab) return NextResponse.json({ error: 'Cab not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/cabs/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
