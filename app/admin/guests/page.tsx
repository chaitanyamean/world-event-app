'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Guest {
  _id: string;
  name: string;
  mobileNumber: string;
  company?: string;
  designation?: string;
  email?: string;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition';
const GREEN = '#2D6A4F';

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  // Add form
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSubmitDisabled = name.trim() === '' || mobileNumber.trim() === '' || isSubmitting;

  async function fetchGuests() {
    setIsLoadingList(true);
    setListError('');
    try {
      const res = await fetch('/api/admin/guests');
      if (!res.ok) throw new Error();
      setGuests(await res.json());
    } catch { setListError('Could not load guests. Please refresh.'); }
    finally { setIsLoadingList(false); }
  }

  useEffect(() => { fetchGuests(); }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mobileNumber: mobileNumber.trim(), company: company.trim() || undefined, designation: designation.trim() || undefined, email: email.trim() || undefined }),
      });
      if (res.status === 409) { setFormError('A guest with this mobile number already exists.'); return; }
      if (!res.ok) { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Failed to add guest.'); return; }
      setFormSuccess(`Guest "${name.trim()}" added.`);
      setName(''); setMobileNumber(''); setCompany(''); setDesignation(''); setEmail('');
      await fetchGuests();
    } catch { setFormError('Something went wrong.'); }
    finally { setIsSubmitting(false); }
  }

  function startEdit(g: Guest) {
    setEditingId(g._id);
    setEditName(g.name); setEditMobile(g.mobileNumber);
    setEditCompany(g.company ?? ''); setEditDesignation(g.designation ?? ''); setEditEmail(g.email ?? '');
    setEditError('');
  }

  async function handleSave(id: string) {
    setEditError(''); setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), mobileNumber: editMobile.trim(), company: editCompany.trim() || undefined, designation: editDesignation.trim() || undefined, email: editEmail.trim() || undefined }),
      });
      if (res.status === 409) { setEditError('Mobile number already in use.'); return; }
      if (!res.ok) { const d = await res.json().catch(() => ({})); setEditError(d.error ?? 'Failed to save.'); return; }
      setEditingId(null);
      await fetchGuests();
    } catch { setEditError('Something went wrong.'); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(id: string, guestName: string) {
    if (!confirm(`Delete guest "${guestName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete guest.'); return; }
      await fetchGuests();
    } catch { alert('Something went wrong.'); }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>← Back to Admin</Link>
      <h2 className="text-xl font-bold text-gray-900">Manage Guests</h2>

      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New Guest</h3>
        <form onSubmit={handleAdd} noValidate className="space-y-4">
          <div><label htmlFor="g-name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label><input id="g-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} /></div>
          <div><label htmlFor="g-mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile <span className="text-red-500">*</span></label><input id="g-mobile" type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile number" className={inputCls} /></div>
          <div><label htmlFor="g-company" className="block text-sm font-medium text-gray-700 mb-1">Company</label><input id="g-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" className={inputCls} /></div>
          <div><label htmlFor="g-desig" className="block text-sm font-medium text-gray-700 mb-1">Designation</label><input id="g-desig" type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Optional" className={inputCls} /></div>
          <div><label htmlFor="g-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label><input id="g-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" className={inputCls} /></div>
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{formSuccess}</p>}
          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: GREEN }}>{isSubmitting ? 'Adding…' : 'Add Guest'}</button>
        </form>
      </div>

      {/* Guest list */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Guests</h3>
        {isLoadingList ? <p className="text-sm text-gray-500">Loading…</p>
          : listError ? <p className="text-sm text-red-600">{listError}</p>
          : guests.length === 0 ? <p className="text-sm text-gray-500">No guests yet.</p>
          : (
            <ul className="divide-y divide-gray-100">
              {guests.map((g) => (
                <li key={g._id} className="py-3">
                  {editingId === g._id ? (
                    <div className="space-y-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" className={inputCls} />
                      <input value={editMobile} onChange={(e) => setEditMobile(e.target.value)} placeholder="Mobile" className={inputCls} />
                      <input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} placeholder="Company (optional)" className={inputCls} />
                      <input value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} placeholder="Designation (optional)" className={inputCls} />
                      <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email (optional)" className={inputCls} />
                      {editError && <p className="text-xs text-red-600">{editError}</p>}
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(g._id)} disabled={isSaving} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: GREEN }}>{isSaving ? 'Saving…' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{g.name}</p>
                        <p className="text-sm text-gray-600">{g.mobileNumber}</p>
                        {g.company && <p className="text-xs text-gray-500">{g.company}</p>}
                        {g.designation && <p className="text-xs text-gray-500">{g.designation}</p>}
                        {g.email && <p className="text-xs text-gray-500">{g.email}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEdit(g)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: GREEN }}>Edit</button>
                        <button onClick={() => handleDelete(g._id, g.name)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Delete</button>
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
