import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import POC from '@/models/POC';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, mobile } = body as Record<string, unknown>;
  if (!name || typeof name !== 'string' || !name.trim())
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!mobile || typeof mobile !== 'string' || !mobile.trim())
    return NextResponse.json({ error: 'mobile is required' }, { status: 400 });

  try {
    await connectDB();
    const poc = await POC.findByIdAndUpdate(
      params.id,
      { name: name.trim(), mobile: mobile.trim() },
      { new: true }
    );
    if (!poc) return NextResponse.json({ error: 'POC not found' }, { status: 404 });
    return NextResponse.json(poc);
  } catch (error) {
    console.error('[PATCH /api/admin/pocs/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const poc = await POC.findByIdAndDelete(params.id);
    if (!poc) return NextResponse.json({ error: 'POC not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/pocs/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
