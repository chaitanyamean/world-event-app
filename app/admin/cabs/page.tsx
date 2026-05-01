'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Cab { _id: string; driverName: string; driverMobile: string; vehicleNumber: string; pickupTime?: string; pickupLocation?: string; dropLocation?: string; }

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition';
const GREEN = '#2D6A4F';

export default function AdminCabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Cab>>({});
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSubmitDisabled = driverName.trim() === '' || driverMobile.trim() === '' || vehicleNumber.trim() === '' || isSubmitting;

  async function fetchCabs() {
    setIsLoadingList(true); setListError('');
    try { const res = await fetch('/api/admin/cabs'); if (!res.ok) throw new Error(); setCabs(await res.json()); }
    catch { setListError('Could not load cabs. Please refresh.'); }
    finally { setIsLoadingList(false); }
  }

  useEffect(() => { fetchCabs(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError(''); setFormSuccess(''); setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/cabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ driverName: driverName.trim(), driverMobile: driverMobile.trim(), vehicleNumber: vehicleNumber.trim(), pickupTime: pickupTime.trim() || undefined, pickupLocation: pickupLocation.trim() || undefined, dropLocation: dropLocation.trim() || undefined }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to add cab.'); return; }
      setFormSuccess(`Cab for "${driverName.trim()}" added.`);
      setDriverName(''); setDriverMobile(''); setVehicleNumber(''); setPickupTime(''); setPickupLocation(''); setDropLocation('');
      await fetchCabs();
    } catch { setFormError('Something went wrong.'); }
    finally { setIsSubmitting(false); }
  }

  function startEdit(c: Cab) { setEditingId(c._id); setEdit({ ...c }); setEditError(''); }

  async function handleSave(id: string) {
    setEditError(''); setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/cabs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edit) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setEditError(d.error ?? 'Failed to save.'); return; }
      setEditingId(null); await fetchCabs();
    } catch { setEditError('Something went wrong.'); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete cab for "${name}"?`)) return;
    try { const res = await fetch(`/api/admin/cabs/${id}`, { method: 'DELETE' }); if (!res.ok) { alert('Failed to delete.'); return; } await fetchCabs(); }
    catch { alert('Something went wrong.'); }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>← Back to Admin</Link>
      <h2 className="text-xl font-bold text-gray-900">Manage Cabs</h2>

      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New Cab</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Driver Name <span className="text-red-500">*</span></label><input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver's full name" className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Driver Mobile <span className="text-red-500">*</span></label><input type="tel" value={driverMobile} onChange={(e) => setDriverMobile(e.target.value)} placeholder="Mobile number" className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number <span className="text-red-500">*</span></label><input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="Registration number" className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label><input type="text" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} placeholder="e.g. 10:00 AM (optional)" className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label><input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Optional" className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label><input type="text" value={dropLocation} onChange={(e) => setDropLocation(e.target.value)} placeholder="Optional" className={inputCls} /></div>
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{formSuccess}</p>}
          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: GREEN }}>{isSubmitting ? 'Adding…' : 'Add Cab'}</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Cabs</h3>
        {isLoadingList ? <p className="text-sm text-gray-500">Loading…</p>
          : listError ? <p className="text-sm text-red-600">{listError}</p>
          : cabs.length === 0 ? <p className="text-sm text-gray-500">No cabs yet.</p>
          : (
            <ul className="divide-y divide-gray-100">
              {cabs.map((c) => (
                <li key={c._id} className="py-3">
                  {editingId === c._id ? (
                    <div className="space-y-2">
                      <input value={edit.driverName ?? ''} onChange={(e) => setEdit({ ...edit, driverName: e.target.value })} placeholder="Driver name" className={inputCls} />
                      <input value={edit.driverMobile ?? ''} onChange={(e) => setEdit({ ...edit, driverMobile: e.target.value })} placeholder="Driver mobile" className={inputCls} />
                      <input value={edit.vehicleNumber ?? ''} onChange={(e) => setEdit({ ...edit, vehicleNumber: e.target.value })} placeholder="Vehicle number" className={inputCls} />
                      <input value={edit.pickupTime ?? ''} onChange={(e) => setEdit({ ...edit, pickupTime: e.target.value })} placeholder="Pickup time (optional)" className={inputCls} />
                      <input value={edit.pickupLocation ?? ''} onChange={(e) => setEdit({ ...edit, pickupLocation: e.target.value })} placeholder="Pickup location (optional)" className={inputCls} />
                      <input value={edit.dropLocation ?? ''} onChange={(e) => setEdit({ ...edit, dropLocation: e.target.value })} placeholder="Drop location (optional)" className={inputCls} />
                      {editError && <p className="text-xs text-red-600">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(c._id)} disabled={isSaving} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: GREEN }}>{isSaving ? 'Saving…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.driverName}</p>
                        <p className="text-sm text-gray-600">{c.driverMobile} · {c.vehicleNumber}</p>
                        {c.pickupTime && <p className="text-xs text-gray-500">Pickup: {c.pickupTime}</p>}
                        {c.pickupLocation && <p className="text-xs text-gray-500">From: {c.pickupLocation}</p>}
                        {c.dropLocation && <p className="text-xs text-gray-500">To: {c.dropLocation}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(c)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: GREEN }}>Edit</button>
                        <button onClick={() => handleDelete(c._id, c.driverName)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Delete</button>
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
