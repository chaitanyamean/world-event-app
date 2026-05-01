import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Assignment from '@/models/Assignment';

/**
 * GET /api/debug
 * Temporary endpoint to diagnose prod data issues.
 * Remove after the issue is resolved.
 */
export async function GET() {
  const result: Record<string, unknown> = {};

  // 1. Check env vars are present (values hidden)
  result.env = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'NOT SET',
  };

  // 2. Check session
  try {
    const session = await getServerSession(authOptions);
    result.session = session
      ? { userId: session.user?.userId, role: session.user?.role, name: session.user?.name }
      : null;
  } catch (err) {
    result.sessionError = String(err);
  }

  // 3. Check DB connection
  try {
    await connectDB();
    result.dbConnected = true;
  } catch (err) {
    result.dbConnected = false;
    result.dbError = String(err);
  }

  // 4. Count assignments in DB
  if (result.dbConnected) {
    try {
      result.assignmentCount = await Assignment.countDocuments({});
    } catch (err) {
      result.assignmentCountError = String(err);
    }
  }

  return NextResponse.json(result);
}
