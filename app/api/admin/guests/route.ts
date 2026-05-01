import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const guests = await User.find({ role: 'guest' }).select('name mobileNumber company designation email createdAt');
    return NextResponse.json(guests);
  } catch (error) {
    console.error('[GET /api/admin/guests]', error);
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

  const { name, mobileNumber, company, designation, email } = body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || !name.trim())
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!mobileNumber || typeof mobileNumber !== 'string' || !mobileNumber.trim())
    return NextResponse.json({ error: 'mobileNumber is required' }, { status: 400 });

  try {
    await connectDB();
    const passwordHash = await bcrypt.hash('guest123', 10);
    const guestData: Record<string, unknown> = {
      name: (name as string).trim(),
      mobileNumber: (mobileNumber as string).trim(),
      passwordHash,
      role: 'guest',
    };
    if (company && typeof company === 'string' && company.trim()) guestData.company = company.trim();
    if (designation && typeof designation === 'string' && designation.trim()) guestData.designation = designation.trim();
    if (email && typeof email === 'string' && email.trim()) guestData.email = email.trim();

    const guest = await User.create(guestData);
    const { passwordHash: _ph, ...safeGuest } = guest.toObject();
    void _ph;
    return NextResponse.json(safeGuest, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000)
      return NextResponse.json({ error: 'A guest with this mobile number already exists' }, { status: 409 });
    console.error('[POST /api/admin/guests]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
