import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F7F5' }}>
      <header className="px-4 py-3 shadow-sm" style={{ backgroundColor: '#1B5E45' }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="WEEW"
              width={120}
              height={40}
              className="object-contain"
            />
            <span className="text-xs font-medium text-white/70 border-l border-white/30 pl-3">
              Admin
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
