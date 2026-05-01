import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getGuestDashboardData } from '@/lib/services/guestService';
import HotelCard from '@/components/HotelCard';
import CabCard from '@/components/CabCard';
import POCCard from '@/components/POCCard';
import AgendaCard from '@/components/AgendaCard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.userId) redirect('/login');

  let assignment = null;
  try {
    assignment = await getGuestDashboardData(session.user.userId, session.user.userId);
  } catch (err) {
    console.error('[DashboardPage] failed to load assignment:', err);
    assignment = null;
  }

  // Merge hotel name/address with assignment-level check-in/out/room
  const assignmentObj = assignment as unknown as Record<string, unknown> | null;
  const hotelDoc = (assignmentObj?.hotelId as Record<string, unknown> | null) ?? null;
  const hotel = hotelDoc
    ? {
        hotelName: hotelDoc.hotelName as string,
        address: hotelDoc.address as string,
        checkInDate: assignmentObj?.checkInDate as string | null ?? null,
        checkOutDate: assignmentObj?.checkOutDate as string | null ?? null,
        roomNumber: assignmentObj?.roomNumber as string | null ?? null,
      }
    : null;

  const cab = (assignmentObj?.cabId as Record<string, unknown> | null) ?? null;
  const poc = (assignmentObj?.pocId as Record<string, unknown> | null) ?? null;

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">Welcome back, {session.user.name ?? 'Guest'}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HotelCard hotel={hotel} />
        <CabCard cab={cab as never} />
        <POCCard poc={poc as never} />
        <AgendaCard />
      </div>
    </div>
  );
}
