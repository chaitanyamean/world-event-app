'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Guest { _id: string; name: string; mobileNumber: string; }
interface Hotel { _id: string; hotelName: string; address: string; }
interface Cab { _id: string; driverName: string; }
interface POC { _id: string; name: string; }
interface Assignment {
  _id: string;
  guestId: { _id: string; name: string; mobileNumber: string } | null;
  hotelId: { _id: string; hotelName: string } | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  roomNumber?: string | null;
  cabId: { _id: string; driverName: string } | null;
  pocId: { _id: string; name: string } | null;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition bg-white';
const GREEN = '#2D6A4F';

function toDateInput(val?: string | null) {
  if (!val) return '';
  return new Date(val).toISOString().split('T')[0];
}

export default function AdminAssignmentsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [pocs, setPocs] = useState<POC[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [guestId, setGuestId] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [cabId, setCabId] = useState('');
  const [pocId, setPocId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // true when editing an existing assignment

  const formRef = useRef<HTMLDivElement>(null);
  const isSubmitDisabled = guestId === '' || isSubmitting;

  async function fetchAll() {
    setIsLoadingList(true); setListError('');
    try {
      const res = await fetch('/api/admin/assignments/init');
      if (!res.ok) throw new Error();
      const { guests: g, hotels: h, cabs: c, pocs: p, assignments: a } = await res.json();
      setGuests(g); setHotels(h); setCabs(c); setPocs(p); setAssignments(a);
    } catch { setListError('Could not load data. Please refresh.'); }
    finally { setIsLoadingList(false); }
  }

  async function fetchAssignments() {
    try { const res = await fetch('/api/admin/assignments'); if (res.ok) setAssignments(await res.json()); }
    catch { /* silent */ }
  }

  useEffect(() => { fetchAll(); }, []);

  function startEdit(a: Assignment) {
    setIsEditing(true);
    setGuestId(a.guestId?._id ?? '');
    setHotelId(a.hotelId?._id ?? '');
    setCheckInDate(toDateInput(a.checkInDate));
    setCheckOutDate(toDateInput(a.checkOutDate));
    setRoomNumber(a.roomNumber ?? '');
    setCabId(a.cabId?._id ?? '');
    setPocId(a.pocId?._id ?? '');
    setFormError(''); setFormSuccess('');
    // Scroll form into view
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function cancelEdit() {
    setIsEditing(false);
    setGuestId(''); setHotelId(''); setCheckInDate(''); setCheckOutDate('');
    setRoomNumber(''); setCabId(''); setPocId('');
    setFormError(''); setFormSuccess('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          hotelId: hotelId || null,
          checkInDate: hotelId ? checkInDate || null : null,
          checkOutDate: hotelId ? checkOutDate || null : null,
          roomNumber: hotelId ? roomNumber || null : null,
          cabId: cabId || null,
          pocId: pocId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? 'Failed to save assignment.');
        return;
      }
      const g = guests.find((x) => x._id === guestId);
      setFormSuccess(`Assignment for "${g?.name ?? 'guest'}" saved successfully.`);
      setIsEditing(false);
      setGuestId(''); setHotelId(''); setCheckInDate(''); setCheckOutDate('');
      setRoomNumber(''); setCabId(''); setPocId('');
      await fetchAssignments();
    } catch { setFormError('Something went wrong. Please try again.'); }
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(id: string, guestName: string) {
    if (!confirm(`Delete assignment for "${guestName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/assignments/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete assignment.'); return; }
      await fetchAssignments();
    } catch { alert('Something went wrong.'); }
  }

  function fmt(d?: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>
        ← Back to Admin
      </Link>
      <h2 className="text-xl font-bold text-gray-900">Manage Assignments</h2>

      {/* Form */}
      <div ref={formRef} className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: `2px solid ${isEditing ? GREEN : '#D1E8DF'}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            {isEditing ? '✏️ Edit Assignment' : 'Assign to Guest'}
          </h3>
          {isEditing && (
            <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="a-guest" className="block text-sm font-medium text-gray-700 mb-1">Guest <span className="text-red-500">*</span></label>
            <select id="a-guest" value={guestId} onChange={(e) => setGuestId(e.target.value)} disabled={isEditing} className={`${inputCls} ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <option value="">Select a guest</option>
              {guests.map((g) => <option key={g._id} value={g._id}>{g.name} ({g.mobileNumber})</option>)}
            </select>
            {isEditing && <p className="text-xs text-gray-400 mt-1">Guest cannot be changed — delete and re-create to reassign.</p>}
          </div>

          <div>
            <label htmlFor="a-hotel" className="block text-sm font-medium text-gray-700 mb-1">Hotel</label>
            <select id="a-hotel" value={hotelId} onChange={(e) => { setHotelId(e.target.value); if (!e.target.value) { setCheckInDate(''); setCheckOutDate(''); setRoomNumber(''); } }} className={inputCls}>
              <option value="">None</option>
              {hotels.map((h) => <option key={h._id} value={h._id}>{h.hotelName} — {h.address}</option>)}
            </select>
          </div>

          {hotelId && (
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#EBF5F0', border: '1px solid #C1DDD4' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: GREEN }}>Guest Hotel Details</p>
              <div>
                <label htmlFor="a-checkin" className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <input id="a-checkin" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition" />
              </div>
              <div>
                <label htmlFor="a-checkout" className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <input id="a-checkout" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition" />
              </div>
              <div>
                <label htmlFor="a-room" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input id="a-room" type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. 204" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="a-cab" className="block text-sm font-medium text-gray-700 mb-1">Cab</label>
            <select id="a-cab" value={cabId} onChange={(e) => setCabId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {cabs.map((c) => <option key={c._id} value={c._id}>{c.driverName}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="a-poc" className="block text-sm font-medium text-gray-700 mb-1">POC</label>
            <select id="a-poc" value={pocId} onChange={(e) => setPocId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {pocs.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{formSuccess}</p>}

          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: GREEN }}>
            {isSubmitting ? 'Saving…' : isEditing ? 'Update Assignment' : 'Save Assignment'}
          </button>
        </form>
      </div>

      {/* Assignments list */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Current Assignments</h3>
        {isLoadingList ? <p className="text-sm text-gray-500">Loading…</p>
          : listError ? <p role="alert" className="text-sm text-red-600">{listError}</p>
          : assignments.length === 0 ? <p className="text-sm text-gray-500">No assignments yet.</p>
          : (
            <ul className="divide-y divide-gray-100">
              {assignments.map((a) => (
                <li key={a._id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-gray-900">{a.guestId?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{a.guestId?.mobileNumber}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Hotel:</span> {a.hotelId?.hotelName ?? 'None'}
                        {a.hotelId && a.roomNumber && <span className="text-gray-500"> · Room {a.roomNumber}</span>}
                        {a.hotelId && a.checkInDate && <span className="text-gray-500"> · {fmt(a.checkInDate)} → {fmt(a.checkOutDate)}</span>}
                      </p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Cab:</span> {a.cabId?.driverName ?? 'None'}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">POC:</span> {a.pocId?.name ?? 'None'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(a)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: GREEN }}>Edit</button>
                      <button onClick={() => handleDelete(a._id, a.guestId?.name ?? 'this guest')} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
