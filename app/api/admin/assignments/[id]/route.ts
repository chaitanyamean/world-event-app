import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await connectDB();
    const assignment = await Assignment.findByIdAndDelete(params.id);
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/assignments/:id]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
