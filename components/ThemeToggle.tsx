'use client';

import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 防止 hydration mismatch
  if (!mounted) {
    return (
      <div className="w-14 h-7 bg-gray-300 rounded-full relative cursor-pointer">
        <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">深淺模式</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 border-2 border-gray-300 dark:border-gray-600"
        style={{
          backgroundColor: theme === 'dark' ? '#1e293b' : '#dbeafe',
        }}
        aria-label="切換主題"
        title={`切換到${theme === 'light' ? '深色' : '淺色'}模式`}
      >
      {/* 背景圖標 - 月亮在左邊 */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2">
        <svg
          className="w-4 h-4 text-indigo-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>
      
      {/* 背景圖標 - 太陽在右邊 */}
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
        <svg
          className="w-4 h-4 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      
      {/* 滑動按鈕 */}
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'translate-x-1' : 'translate-x-7'
        }`}
      />
      </button>
    </div>
  );
}

