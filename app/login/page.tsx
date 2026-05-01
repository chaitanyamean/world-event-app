'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSubmitDisabled =
    mobileNumber.trim() === '' || password.trim() === '' || isLoading;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        mobileNumber,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid mobile number or password');
      } else if (result?.ok) {
        const session = await getSession();
        if (session?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch {
      setError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#1B5E45' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="WEEW — World Events Economy Week"
            width={240}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg px-6 py-8">
          <h2 className="text-center text-lg font-semibold mb-6" style={{ color: '#1B5E45' }}>
            Guest Portal
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                type="tel"
                autoComplete="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#2D6A4F' } as React.CSSProperties}
                onFocus={(e) => e.target.style.borderColor = '#2D6A4F'}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                onFocus={(e) => e.target.style.borderColor = '#2D6A4F'}
                onBlur={(e) => e.target.style.borderColor = ''}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isSubmitDisabled ? '#6B9E8A' : '#2D6A4F' }}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          World Events Economy Week
        </p>
      </div>
    </main>
  );
}
