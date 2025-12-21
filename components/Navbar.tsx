'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    // 立即清除未讀數量，避免顯示舊數據
    setUnreadCount(0);
    // 登出並重定向到登入頁
    await signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  useEffect(() => {
    if (!session) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/conversations/unread');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.total || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll for unread messages every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [session]);

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // 檢查是否點擊了漢堡按鈕
        if (!target.closest('[data-mobile-menu-button]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                家教網平台
              </Link>
              {/* 漢堡選單按鈕（僅手機版顯示） */}
              <button
                data-mobile-menu-button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="ml-4 sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-label="主選單"
              >
                {isMobileMenuOpen ? (
                  // X 圖標（關閉）
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  // 漢堡圖標（開啟）
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive('/')
                    ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                題目討論
              </Link>
              <Link
                href="/tutoring"
                className={`${
                  isActive('/tutoring')
                    ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                家教專區
              </Link>
              <Link
                href="/library"
                className={`${
                  isActive('/library')
                    ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                題目與筆記
              </Link>
              <Link
                href="/chat"
                className={`${
                  isActive('/chat')
                    ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative transition-colors`}
              >
                訊息
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {/* 用戶頭像下拉菜單 */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {session.user?.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
                        <span className="text-white text-sm font-bold">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* 下拉菜單 */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href={`/profile/${session.user?.id}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        個人檔案
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        登出
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium transition-colors"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  註冊
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 手機版選單 */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="sm:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1">
              {/* 導航連結 */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  isActive('/')
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
              >
                題目討論
              </Link>
              <Link
                href="/tutoring"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  isActive('/tutoring')
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
              >
                家教專區
              </Link>
              <Link
                href="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  isActive('/library')
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
              >
                題目與筆記
              </Link>
              <Link
                href="/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${
                  isActive('/chat')
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors relative`}
              >
                <span className="flex items-center justify-between">
                  <span>訊息</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            </div>

            {/* 已登入用戶資訊 */}
            {session ? (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center px-4 mb-3">
                  {session.user?.image ? (
                    <div className="flex-shrink-0">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getInitials(session.user?.name || 'U')}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">
                      {session.user?.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/profile/${session.user?.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    個人檔案
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    登出
                  </button>
                </div>
              </div>
            ) : (
              /* 未登入時的登入/註冊按鈕 */
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  註冊
                </Link>
              </div>
            )}

            {/* 主題切換（手機版） */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 px-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                  深色模式
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

