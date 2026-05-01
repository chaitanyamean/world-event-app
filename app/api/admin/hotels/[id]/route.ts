import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { hotelName, address } = body as Record<string, unknown>;
  if (!hotelName || typeof hotelName !== 'string' || !hotelName.trim())
    return NextResponse.json({ error: 'hotelName is required' }, { status: 400 });
  if (!address || typeof address !== 'string' || !address.trim())
    return NextResponse.json({ error: 'address is required' }, { status: 400 });

  try {
    await connectDB();
    const hotel = await Hotel.findByIdAndUpdate(
      params.id,
      { $set: { hotelName: (hotelName as string).trim(), address: (address as string).trim() } },
      { new: true }
    );
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('[PUT /api/admin/hotels/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const hotel = await Hotel.findByIdAndDelete(params.id);
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/hotels/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
