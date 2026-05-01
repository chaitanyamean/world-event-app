import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const update: Record<string, unknown> = {
      name: (name as string).trim(),
      mobileNumber: (mobileNumber as string).trim(),
    };
    if (company && typeof company === 'string' && company.trim()) update.company = company.trim();
    else update.company = undefined;
    if (designation && typeof designation === 'string' && designation.trim()) update.designation = designation.trim();
    else update.designation = undefined;
    if (email && typeof email === 'string' && email.trim()) update.email = email.trim();
    else update.email = undefined;

    const guest = await User.findByIdAndUpdate(
      params.id,
      { $set: update, $unset: { ...(!update.company && { company: '' }), ...(!update.designation && { designation: '' }), ...(!update.email && { email: '' }) } },
      { new: true }
    ).select('name mobileNumber company designation email createdAt');

    if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    return NextResponse.json(guest);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000)
      return NextResponse.json({ error: 'A guest with this mobile number already exists' }, { status: 409 });
    console.error('[PUT /api/admin/guests/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const guest = await User.findByIdAndDelete(params.id);
    if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/guests/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
