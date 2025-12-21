'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || '發生錯誤，請稍後再試');
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 transition-colors">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            忘記密碼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            請輸入您的電子郵件地址，我們將發送重設密碼的連結給您
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded transition-colors">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded transition-colors">
              重設密碼的連結已發送到您的電子郵件，請檢查您的收件匣（包含垃圾郵件資料夾）。
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              電子郵件
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:z-10 sm:text-sm transition-colors"
              placeholder="電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={success || loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '發送中...' : success ? '已發送' : '發送重設連結'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm transition-colors"
            >
              返回登入頁面
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

