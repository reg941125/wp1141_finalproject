'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface JobPosting {
  _id: string;
  type: 'seeking_tutor' | 'seeking_student';
  title: string;
  tags: string[];
  targetEducationLevels: ('elementary' | 'middle' | 'high' | 'university')[];
  hourlyRate: {
    min: number;
    max?: number;
  };
  requirements: string;
  authorId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  isActive: boolean;
}

const educationLevelMap = {
  elementary: '國小',
  middle: '國中',
  high: '高中',
  university: '大學',
};

export default function JobPostingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const fetchPosting = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPosting(data);
      }
    } catch (error) {
      console.error('Error fetching posting:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchPosting();
    }
  }, [params.id, fetchPosting]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">載入中...</div>;
  }

  if (!posting) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">徵人訊息不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{posting.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              posting.type === 'seeking_tutor'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
            }`}
          >
            {posting.type === 'seeking_tutor' ? '徵家教' : '徵學生'}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>發布者: {posting.authorId?.name || '匿名'}</span>
          <span>發布時間: {new Date(posting.createdAt).toLocaleDateString('zh-TW')}</span>
        </div>

        <div className="flex space-x-2 mb-4">
          {posting.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">目標教育程度:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {posting.targetEducationLevels?.map(level => educationLevelMap[level]).join('、') || '未指定'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">時薪:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              ${posting.hourlyRate.min}
              {posting.hourlyRate.max ? ` - $${posting.hourlyRate.max}` : ''}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">詳細要求</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{posting.requirements}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {session && session.user.id !== posting.authorId._id && (
          <button
            onClick={async () => {
              if (creatingConversation) return;
              
              setCreatingConversation(true);
              try {
                const response = await fetch('/api/conversations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ otherUserId: posting.authorId._id }),
                });
                
                if (response.ok) {
                  const conversation = await response.json();
                  // 使用 Next.js router 進行客戶端導航，避免重新載入頁面
                  router.push(`/chat/${conversation._id}`);
                } else {
                  console.error('Failed to create conversation:', response.status);
                  alert('建立對話失敗，請稍後再試');
                }
              } catch (error) {
                console.error('Error creating conversation:', error);
                alert('建立對話時發生錯誤');
              } finally {
                setCreatingConversation(false);
              }
            }}
            disabled={creatingConversation}
            className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creatingConversation ? '建立對話中...' : '私訊發布者'}
          </button>
        )}
        <Link
          href={`/profile/${posting.authorId._id}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          查看發布者檔案 →
        </Link>
      </div>
    </div>
  );
}


