'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';

interface Notification {
  _id: string;
  type: 'reply' | 'like' | 'follow';
  content: string;
  read: boolean;
  createdAt: string;
  postId?: {
    _id: string;
    title: string;
  };
  triggeredBy: {
    _id: string;
    name: string;
    image?: string;
  };
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isTutoringMenuOpen, setIsTutoringMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const guestMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const tutoringMenuRef = useRef<HTMLDivElement>(null);

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

  // 獲取通知數量
  useEffect(() => {
    if (!session) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [session]);

  // 獲取通知列表
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // 當打開通知面板時獲取通知
  useEffect(() => {
    if (isNotificationOpen && session) {
      fetchNotifications();
    }
  }, [isNotificationOpen, session]);

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      
      if (guestMenuRef.current && !guestMenuRef.current.contains(event.target as Node)) {
        // 檢查是否點擊了訪客選單按鈕
        if (!target.closest('[data-guest-menu-button]')) {
          setIsGuestMenuOpen(false);
        }
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        // 檢查是否點擊了通知按鈕
        if (!target.closest('[data-notification-button]')) {
          setIsNotificationOpen(false);
        }
      }

      if (tutoringMenuRef.current && !tutoringMenuRef.current.contains(event.target as Node)) {
        // 檢查是否點擊了家教專區按鈕
        if (!target.closest('[data-tutoring-button]')) {
          setIsTutoringMenuOpen(false);
        }
      }
    };

    if (isDropdownOpen || isGuestMenuOpen || isNotificationOpen || isTutoringMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isGuestMenuOpen, isNotificationOpen, isTutoringMenuOpen]);

  // 標記通知為已讀
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });
      fetchNotifications();
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // 標記所有通知為已讀
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchNotifications();
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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
              <div className="relative inline-flex" ref={tutoringMenuRef}>
                <button
                  data-tutoring-button
                  onClick={() => setIsTutoringMenuOpen(!isTutoringMenuOpen)}
                  className={`${
                    isActive('/tutoring')
                      ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  家教專區
                </button>
                {isTutoringMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/tutoring/seeking-students"
                        onClick={() => setIsTutoringMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        徵學生
                      </Link>
                      <Link
                        href="/tutoring/seeking-tutors"
                        onClick={() => setIsTutoringMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        徵家教
                      </Link>
                    </div>
                  </div>
                )}
              </div>
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
                
                {/* 通知鈴鐺 */}
                <div className="relative" ref={notificationRef}>
                  <button
                    data-notification-button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="通知"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* 通知下拉面板 */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 z-50 border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
                      {/* 標題欄 */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          通知
                        </h3>
                        {notifications.some((n) => !n.read) && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            全部標為已讀
                          </button>
                        )}
                      </div>

                      {/* 通知列表 */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            目前沒有通知
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                              <div
                                key={notification._id}
                                onClick={() => {
                                  if (!notification.read) {
                                    markAsRead(notification._id);
                                  }
                                  // 根據通知類型導航到不同頁面
                                  if (notification.type === 'follow') {
                                    router.push(`/profile/${notification.triggeredBy._id}`);
                                  } else if (notification.postId) {
                                    router.push(`/questions/${notification.postId._id}`);
                                  }
                                  setIsNotificationOpen(false);
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors ${
                                  notification.read
                                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                                    : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* 觸發者頭像 */}
                                  <Link
                                    href={`/profile/${notification.triggeredBy._id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!notification.read) {
                                        markAsRead(notification._id);
                                      }
                                      setIsNotificationOpen(false);
                                    }}
                                    className="hover:opacity-80 transition-opacity flex-shrink-0"
                                  >
                                    {(notification.triggeredBy.customImage || notification.triggeredBy.image) ? (
                                      <Image
                                        src={notification.triggeredBy.customImage || notification.triggeredBy.image}
                                        alt={notification.triggeredBy.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                                          {notification.triggeredBy.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </Link>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                      <Link
                                        href={`/profile/${notification.triggeredBy._id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!notification.read) {
                                            markAsRead(notification._id);
                                          }
                                          setIsNotificationOpen(false);
                                        }}
                                        className="font-semibold hover:underline"
                                      >
                                        {notification.triggeredBy.name}
                                      </Link>{' '}
                                      {notification.content}
                                    </p>
                                    {notification.postId && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                                        {notification.postId.title}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {new Date(notification.createdAt).toLocaleString('zh-TW')}
                                    </p>
                                  </div>

                                  {/* 未讀標記 */}
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 z-50 border border-gray-200 dark:border-gray-700">
                      {/* 用戶資訊 */}
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      {/* 導航連結（僅手機版顯示） */}
                      <div className="sm:hidden border-b border-gray-200 dark:border-gray-700">
                        <Link
                          href="/"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`${
                            isActive('/')
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          題目討論
                        </Link>
                        <div>
                          <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                            家教專區
                          </div>
                          <Link
                            href="/tutoring/seeking-students"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`${
                              pathname === '/tutoring/seeking-students'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                            } block pl-8 pr-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                          >
                            徵學生
                          </Link>
                          <Link
                            href="/tutoring/seeking-tutors"
                            onClick={() => setIsDropdownOpen(false)}
                            className={`${
                              pathname === '/tutoring/seeking-tutors'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                            } block pl-8 pr-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                          >
                            徵家教
                          </Link>
                        </div>
                        <Link
                          href="/library"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`${
                            isActive('/library')
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          題目與筆記
                        </Link>
                        <Link
                          href="/chat"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`${
                            isActive('/chat')
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative`}
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

                      {/* 個人檔案和登出 */}
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
                {/* 桌面版登入/註冊按鈕 */}
                <div className="hidden sm:flex items-center space-x-4">
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
                
                {/* 手機版選單按鈕 */}
                <div className="sm:hidden relative" ref={guestMenuRef}>
                  <button
                    data-guest-menu-button
                    onClick={() => setIsGuestMenuOpen(!isGuestMenuOpen)}
                    className="flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                    aria-label="選單"
                  >
                    <svg
                      className="h-6 w-6"
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
                  </button>

                  {/* 訪客下拉菜單 */}
                  {isGuestMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 z-50 border border-gray-200 dark:border-gray-700">
                      {/* 導航連結 */}
                      <Link
                        href="/"
                        onClick={() => setIsGuestMenuOpen(false)}
                        className={`${
                          isActive('/')
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        題目討論
                      </Link>
                      <div>
                        <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                          家教專區
                        </div>
                        <Link
                          href="/tutoring/seeking-students"
                          onClick={() => setIsGuestMenuOpen(false)}
                          className={`${
                            pathname === '/tutoring/seeking-students'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          } block pl-8 pr-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          徵學生
                        </Link>
                        <Link
                          href="/tutoring/seeking-tutors"
                          onClick={() => setIsGuestMenuOpen(false)}
                          className={`${
                            pathname === '/tutoring/seeking-tutors'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          } block pl-8 pr-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        >
                          徵家教
                        </Link>
                      </div>
                      <Link
                        href="/library"
                        onClick={() => setIsGuestMenuOpen(false)}
                        className={`${
                          isActive('/library')
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        題目與筆記
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setIsGuestMenuOpen(false)}
                        className={`${
                          isActive('/chat')
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        } block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        訊息
                      </Link>
                      
                      {/* 分隔線 */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      
                      {/* 登入/註冊 */}
                      <Link
                        href="/login"
                        onClick={() => setIsGuestMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        登入
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsGuestMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                      >
                        註冊
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

