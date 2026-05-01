'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hotel { _id: string; hotelName: string; address: string; }

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition';
const GREEN = '#2D6A4F';

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSubmitDisabled = hotelName.trim() === '' || address.trim() === '' || isSubmitting;

  async function fetchHotels() {
    setIsLoadingList(true); setListError('');
    try {
      const res = await fetch('/api/admin/hotels');
      if (!res.ok) throw new Error();
      setHotels(await res.json());
    } catch { setListError('Could not load hotels. Please refresh.'); }
    finally { setIsLoadingList(false); }
  }

  useEffect(() => { fetchHotels(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelName: hotelName.trim(), address: address.trim() }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to add hotel.'); return; }
      setFormSuccess(`Hotel "${hotelName.trim()}" added.`);
      setHotelName(''); setAddress('');
      await fetchHotels();
    } catch { setFormError('Something went wrong.'); }
    finally { setIsSubmitting(false); }
  }

  function startEdit(h: Hotel) { setEditingId(h._id); setEditName(h.hotelName); setEditAddress(h.address); setEditError(''); }

  async function handleSave(id: string) {
    setEditError(''); setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelName: editName.trim(), address: editAddress.trim() }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setEditError(d.error ?? 'Failed to save.'); return; }
      setEditingId(null); await fetchHotels();
    } catch { setEditError('Something went wrong.'); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete hotel "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete hotel.'); return; }
      await fetchHotels();
    } catch { alert('Something went wrong.'); }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>← Back to Admin</Link>
      <h2 className="text-xl font-bold text-gray-900">Manage Hotels</h2>

      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New Hotel</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div><label htmlFor="h-name" className="block text-sm font-medium text-gray-700 mb-1">Hotel Name <span className="text-red-500">*</span></label><input id="h-name" type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="Hotel name" className={inputCls} /></div>
          <div><label htmlFor="h-addr" className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label><input id="h-addr" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className={inputCls} /></div>
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{formSuccess}</p>}
          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: GREEN }}>{isSubmitting ? 'Adding…' : 'Add Hotel'}</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Hotels</h3>
        {isLoadingList ? <p className="text-sm text-gray-500">Loading…</p>
          : listError ? <p className="text-sm text-red-600">{listError}</p>
          : hotels.length === 0 ? <p className="text-sm text-gray-500">No hotels yet.</p>
          : (
            <ul className="divide-y divide-gray-100">
              {hotels.map((h) => (
                <li key={h._id} className="py-3">
                  {editingId === h._id ? (
                    <div className="space-y-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Hotel name" className={inputCls} />
                      <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Address" className={inputCls} />
                      {editError && <p className="text-xs text-red-600">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(h._id)} disabled={isSaving} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: GREEN }}>{isSaving ? 'Saving…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.hotelName}</p>
                        <p className="text-sm text-gray-600">{h.address}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(h)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: GREEN }}>Edit</button>
                        <button onClick={() => handleDelete(h._id, h.hotelName)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Delete</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
