'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      if (data.authenticated) {
        setAuthenticated(true);
        fetchUsers();
        fetchAnnouncements();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      const data = await response.json();
      if (response.ok) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error('Fetch announcements error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('確定要刪除此用戶嗎？此操作無法復原。')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert('用戶已刪除');
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('刪除失敗');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert('請填寫標題和內容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
        }),
      });

      if (response.ok) {
        alert('公告已發布');
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setShowAnnouncementForm(false);
        fetchAnnouncements();
      } else {
        const data = await response.json();
        alert(data.error || '發布失敗');
      }
    } catch (error) {
      console.error('Create announcement error:', error);
      alert('發布失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('確定要刪除此公告嗎？')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ announcementId }),
      });

      if (response.ok) {
        alert('公告已刪除');
        fetchAnnouncements();
      } else {
        const data = await response.json();
        alert(data.error || '刪除失敗');
      }
    } catch (error) {
      console.error('Delete announcement error:', error);
      alert('刪除失敗');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">管理員後台</h1>
          <div className="space-x-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              返回首頁
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 用戶管理 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">用戶管理</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">共 {users.length} 位用戶</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">姓名</th>
                    <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">電子郵件</th>
                    <th className="text-left py-2 px-2 text-gray-700 dark:text-gray-300">註冊時間</th>
                    <th className="text-right py-2 px-2 text-gray-700 dark:text-gray-300">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-2 text-gray-900 dark:text-gray-100">{user.name}</td>
                      <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 公告管理 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">公告管理</h2>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {showAnnouncementForm ? '取消' : '新增公告'}
              </button>
            </div>

            {showAnnouncementForm && (
              <form onSubmit={handleCreateAnnouncement} className="mb-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    標題
                  </label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    內容
                  </label>
                  <textarea
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? '發布中...' : '發布公告'}
                </button>
              </form>
            )}

            <div className="max-h-96 overflow-y-auto space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm transition-colors"
                    >
                      刪除
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(announcement.createdAt).toLocaleString('zh-TW')}
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  尚無公告
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

