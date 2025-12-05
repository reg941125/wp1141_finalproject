'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-900 dark:text-white">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-2xl">
          {/* 開發中圖標 */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <svg
                  className="w-16 h-16 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              {/* 動畫光圈 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 animate-ping opacity-20"></div>
            </div>
          </div>

          {/* 標題 */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              題目與筆記專區
            </h1>
            <div className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-full">
              <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                🚧 功能開發中 🚧
              </p>
            </div>
          </div>

          {/* 說明文字 */}
          <div className="space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              我們正在努力開發這個功能，為您帶來更好的學習體驗。
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
                即將推出的功能：
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  <span>上傳和分享題目檔案</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  <span>建立個人筆記庫</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  <span>瀏覽和下載其他用戶分享的資源</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2">✓</span>
                  <span>依科目和難度分類題目</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

