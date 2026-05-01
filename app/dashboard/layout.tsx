import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7F5' }}>
      <header className="px-4 py-3 shadow-sm" style={{ backgroundColor: '#2D6A4F' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Image
            src="/logo.png"
            alt="WEEW"
            width={120}
            height={40}
            className="object-contain"
          />
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
