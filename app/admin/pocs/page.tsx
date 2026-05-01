'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface POC {
  _id: string;
  name: string;
  mobile: string;
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition';
const GREEN = '#2D6A4F';

export default function AdminPOCsPage() {
  const [pocs, setPocs] = useState<POC[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const isSubmitDisabled = name.trim() === '' || mobile.trim() === '' || isSubmitting;

  async function fetchPOCs() {
    setIsLoadingList(true);
    setListError('');
    try {
      const res = await fetch('/api/admin/pocs');
      if (!res.ok) throw new Error();
      setPocs(await res.json());
    } catch {
      setListError('Could not load POCs. Please refresh.');
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => { fetchPOCs(); }, []);

  function startEdit(poc: POC) {
    setIsEditing(true);
    setEditingId(poc._id);
    setName(poc.name);
    setMobile(poc.mobile);
    setFormError('');
    setFormSuccess('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setMobile('');
    setFormError('');
    setFormSuccess('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/pocs/${editingId}` : '/api/admin/pocs';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? 'Failed to save POC. Please try again.');
        return;
      }

      setFormSuccess(`POC "${name.trim()}" ${isEditing ? 'updated' : 'added'} successfully.`);
      cancelEdit();
      await fetchPOCs();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, pocName: string) {
    if (!confirm(`Delete POC "${pocName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/pocs/${id}`, { method: 'DELETE' });
      if (!res.ok) { alert('Failed to delete POC.'); return; }
      await fetchPOCs();
    } catch {
      alert('Something went wrong.');
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: GREEN }}>
        ← Back to Admin
      </Link>

      <h2 className="text-xl font-bold text-gray-900">Manage POCs</h2>

      {/* Form */}
      <div ref={formRef} className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: `2px solid ${isEditing ? GREEN : '#D1E8DF'}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            {isEditing ? '✏️ Edit POC' : 'Add New POC'}
          </h3>
          {isEditing && (
            <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="poc-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="poc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="poc-mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="poc-mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile number"
              className={inputCls}
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {formError}
            </p>
          )}
          {formSuccess && (
            <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
              {formSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: GREEN }}
          >
            {isSubmitting ? 'Saving…' : isEditing ? 'Update POC' : 'Add POC'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-6" style={{ border: '1px solid #D1E8DF' }}>
        <h3 className="text-base font-semibold text-gray-800 mb-4">All POCs</h3>
        {isLoadingList ? (
          <p className="text-sm text-gray-500">Loading POCs…</p>
        ) : listError ? (
          <p role="alert" className="text-sm text-red-600">{listError}</p>
        ) : pocs.length === 0 ? (
          <p className="text-sm text-gray-500">No POCs added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pocs.map((poc) => (
              <li key={poc._id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{poc.name}</p>
                  <p className="text-sm text-gray-600">{poc.mobile}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(poc)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(poc._id, poc.name)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
