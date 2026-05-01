import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Agenda from '@/models/Agenda';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    return NextResponse.json(await Agenda.findOne({}));
  } catch (error) {
    console.error('[GET /api/admin/agenda]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: 'Invalid multipart/form-data body' }, { status: 400 });
  }

  const file = formData.get('image');
  if (!file || !(file instanceof File))
    return NextResponse.json({ error: 'A file field named "image" is required' }, { status: 400 });
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type))
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted' }, { status: 400 });
  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ error: 'Image must be under 4 MB' }, { status: 413 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
    await connectDB();
    const agenda = await Agenda.findOneAndUpdate(
      {},
      { $set: { imageDataUri: dataUri, mimeType: file.type } },
      { upsert: true, new: true }
    );
    return NextResponse.json(agenda);
  } catch (error) {
    console.error('[POST /api/admin/agenda]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
