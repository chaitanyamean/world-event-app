import Link from 'next/link';

const adminSections = [
  { href: '/admin/guests', emoji: '👥', label: 'Guests' },
  { href: '/admin/hotels', emoji: '🏨', label: 'Hotels' },
  { href: '/admin/cabs', emoji: '🚕', label: 'Cabs' },
  { href: '/admin/pocs', emoji: '📞', label: 'POCs' },
  { href: '/admin/assignments', emoji: '📋', label: 'Assignments' },
  { href: '/admin/agenda', emoji: '🗓️', label: 'Agenda' },
];

export default function AdminPage() {
  return (
    <div>
      <p className="mb-6 text-sm text-gray-500">Select a section to manage.</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {adminSections.map(({ href, emoji, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:bg-[#EBF5F0] hover:ring-[#2D6A4F] transition focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          >
            <span className="text-3xl" aria-hidden="true">{emoji}</span>
            <span className="text-sm font-semibold text-[#1B5E45]">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
