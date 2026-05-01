import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getGuestDashboardData,
  ForbiddenError,
} from '@/lib/services/guestService';

/**
 * GET /api/guest/dashboard
 *
 * Returns the authenticated guest's assignment data (hotel, cab, POC).
 *
 * - 401 if no session exists
 * - 403 if the session role is not "guest" or a ForbiddenError is thrown
 * - 500 on any unexpected / DB error
 *
 * Requirements: 4.1, 4.2, 16.1, 16.2
 */
export async function GET() {
  // 1. Retrieve the server-side session
  const session = await getServerSession(authOptions);

  // 2. Unauthenticated → 401
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Role check — only guests may access this endpoint → 403
  if (session.user.role !== 'guest') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // 4. Fetch the guest's own assignment data.
    //    Both arguments are the session userId so the service's data-isolation
    //    check (guestId === sessionUserId) always passes for a legitimate request.
    const data = await getGuestDashboardData(
      session.user.userId,
      session.user.userId
    );

    // 5. Return the assignment (may be null if no assignment exists yet)
    return NextResponse.json(data);
  } catch (error) {
    // 6. Data-isolation violation thrown by the service layer → 403
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 7. Any other error (DB failure, etc.) → 500
    console.error('[GET /api/guest/dashboard]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
