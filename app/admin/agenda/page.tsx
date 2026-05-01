'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AdminAgendaPage() {
  const [currentImageDataUri, setCurrentImageDataUri] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSubmitDisabled = !selectedFile || isSubmitting;

  async function fetchCurrentAgenda() {
    setIsLoadingPreview(true);
    setPreviewError('');
    try {
      const res = await fetch('/api/admin/agenda');
      if (!res.ok) throw new Error('Failed to load agenda');
      const data = await res.json();
      setCurrentImageDataUri(data?.imageDataUri ?? null);
    } catch {
      setPreviewError('Could not load current agenda. Please refresh.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  useEffect(() => {
    fetchCurrentAgenda();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormError('');
    setFormSuccess('');
    const file = e.target.files?.[0] ?? null;

    if (file && !ALLOWED_MIME_TYPES.includes(file.type)) {
      setFormError('Only JPEG, PNG, and WebP images are accepted');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedFile) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('/api/admin/agenda', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 400) {
        setFormError('Only JPEG, PNG, and WebP images are accepted');
        return;
      }

      if (res.status === 413) {
        setFormError('Image must be under 4 MB');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? 'Failed to upload agenda. Please try again.');
        return;
      }

      setFormSuccess('Agenda image uploaded successfully.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchCurrentAgenda();
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
      >
        ← Back to Admin
      </Link>

      <h2 className="text-xl font-bold text-gray-900">Manage Agenda</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Upload Agenda Image</h3>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="agenda-image" className="block text-sm font-medium text-gray-700 mb-1">
              Image <span className="text-red-500">*</span>
            </label>
            <input
              id="agenda-image"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="mt-1 text-xs text-gray-500">Accepted formats: JPEG, PNG, WebP. Maximum size: 4 MB.</p>
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
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Uploading…' : 'Upload Agenda'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Current Agenda</h3>
        {isLoadingPreview ? (
          <p className="text-sm text-gray-500">Loading current agenda…</p>
        ) : previewError ? (
          <p role="alert" className="text-sm text-red-600">{previewError}</p>
        ) : currentImageDataUri ? (
          <div className="w-full overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageDataUri}
              alt="Current agenda"
              className="w-full h-auto object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">No agenda image uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
