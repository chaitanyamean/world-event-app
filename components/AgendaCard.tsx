'use client';

import { useState } from 'react';

export default function AgendaCard() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function handleClick() {
    if (hasLoaded || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/agenda');
      if (!res.ok) throw new Error('Failed to load agenda');
      const data = await res.json();
      setImageDataUri(data?.imageDataUri ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agenda');
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }

  return (
    <div
      className="rounded-2xl bg-white shadow-sm p-5 cursor-pointer"
      style={{ border: '1px solid #D1E8DF' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#2D6A4F' }}>
        🗓️ Agenda
      </h2>
      {isLoading && <p className="text-sm text-gray-400">Loading agenda...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!isLoading && !error && !hasLoaded && (
        <p className="text-sm text-gray-400 italic">Tap to view agenda</p>
      )}
      {!isLoading && !error && hasLoaded && imageDataUri && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageDataUri} alt="Event agenda" className="w-full rounded-lg object-contain" />
      )}
      {!isLoading && !error && hasLoaded && !imageDataUri && (
        <p className="text-sm text-gray-400 italic">No agenda available yet</p>
      )}
    </div>
  );
}
