'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface POC {
  _id: string;
  name: string;
  mobile: string;
}

export default function AdminPOCsPage() {
  const [pocs, setPocs] = useState<POC[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled =
    name.trim() === '' || mobile.trim() === '' || isSubmitting;

  async function fetchPOCs() {
    setIsLoadingList(true);
    setListError('');
    try {
      const res = await fetch('/api/admin/pocs');
      if (!res.ok) throw new Error('Failed to load POCs');
      const data: POC[] = await res.json();
      setPocs(data);
    } catch {
      setListError('Could not load POCs. Please refresh.');
    } finally {
      setIsLoadingList(false);
    }
  }

  useEffect(() => {
    fetchPOCs();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/pocs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? 'Failed to add POC. Please try again.');
        return;
      }

      setFormSuccess(`POC "${name.trim()}" added successfully.`);
      setName('');
      setMobile('');
      await fetchPOCs();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
        ← Back to Admin
      </Link>

      <h2 className="text-xl font-bold text-gray-900">Manage POCs</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New POC</h3>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="poc-name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input id="poc-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
          </div>
          <div>
            <label htmlFor="poc-mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input id="poc-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
          </div>
          {formError && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{formError}</p>}
          {formSuccess && <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{formSuccess}</p>}
          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {isSubmitting ? 'Adding…' : 'Add POC'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-6">
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
              <li key={poc._id} className="py-3">
                <p className="text-sm font-semibold text-gray-900">{poc.name}</p>
                <p className="text-sm text-gray-600">{poc.mobile}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
