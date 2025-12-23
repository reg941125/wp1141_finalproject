'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Draft {
  _id: string;
  name: string;
  description: string;
  subject: string;
  difficulty: string;
  tags: string[];
  updatedAt: string;
}

export default function DraftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions/draft');
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDrafts();
    }
  }, [status, fetchDrafts]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  const handleDelete = async (draftId: string) => {
    if (!confirm('確定要刪除此草稿嗎？')) return;

    setDeleting(draftId);
    try {
      const response = await fetch(`/api/questions/draft?id=${draftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrafts(drafts.filter((d) => d._id !== draftId));
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('刪除失敗');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
        >
          ← 返回
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">我的草稿</h1>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">目前沒有草稿</p>
          <Link
            href="/library"
            className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            前往新增筆記
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {draft.name || '未命名草稿'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {draft.description || '無描述'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {draft.subject}
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded">
                      {draft.difficulty}
                    </span>
                    {draft.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    更新於 {new Date(draft.updatedAt).toLocaleString('zh-TW')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/library/edit/${draft._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    編輯
                  </Link>
                  <button
                    onClick={() => handleDelete(draft._id)}
                    disabled={deleting === draft._id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {deleting === draft._id ? '刪除中...' : '刪除'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

