import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Cab from '@/models/Cab';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    return NextResponse.json(await Cab.find({}));
  } catch (error) {
    console.error('[GET /api/admin/cabs]', error);
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

  const { driverName, driverMobile, vehicleNumber, pickupTime, pickupLocation, dropLocation } = body as Record<string, unknown>;
  if (!driverName || typeof driverName !== 'string' || !driverName.trim())
    return NextResponse.json({ error: 'driverName is required' }, { status: 400 });
  if (!driverMobile || typeof driverMobile !== 'string' || !driverMobile.trim())
    return NextResponse.json({ error: 'driverMobile is required' }, { status: 400 });
  if (!vehicleNumber || typeof vehicleNumber !== 'string' || !vehicleNumber.trim())
    return NextResponse.json({ error: 'vehicleNumber is required' }, { status: 400 });

  try {
    await connectDB();
    const cabData: Record<string, unknown> = {
      driverName: (driverName as string).trim(),
      driverMobile: (driverMobile as string).trim(),
      vehicleNumber: (vehicleNumber as string).trim(),
    };
    if (pickupTime && typeof pickupTime === 'string' && pickupTime.trim()) cabData.pickupTime = pickupTime.trim();
    if (pickupLocation && typeof pickupLocation === 'string' && pickupLocation.trim()) cabData.pickupLocation = pickupLocation.trim();
    if (dropLocation && typeof dropLocation === 'string' && dropLocation.trim()) cabData.dropLocation = dropLocation.trim();

    const cab = await Cab.create(cabData);
    return NextResponse.json(cab, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/cabs]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
