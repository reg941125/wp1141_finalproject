'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Edit, Trash2 } from 'lucide-react';

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
    image?: string;
  };
  createdAt: string;
  isActive: boolean;
  likes: number;
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
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPosting(data);

          // 如果已登入，獲取按讚狀態
          if (userId) {
            try {
              const likeResponse = await fetch(`/api/jobs/${params.id}/like`);
              if (likeResponse.ok) {
                const { liked } = await likeResponse.json();
                setIsLiked(liked);
              }
            } catch (error) {
              console.error('Error fetching like status:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching posting:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPosting();
    }
  }, [params.id, userId]);

  const handleLike = async () => {
    if (!session) {
      alert('請先登入才能按讚');
      return;
    }

    if (liking) return;

    setLiking(true);
    const wasLiked = isLiked;

    // 樂觀更新 UI
    setIsLiked(!wasLiked);
    if (posting) {
      setPosting({ ...posting, likes: posting.likes + (wasLiked ? -1 : 1) });
    }

    try {
      const response = await fetch(`/api/jobs/${params.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const { liked, likes } = await response.json();
        setIsLiked(liked);
        if (posting) {
          setPosting({ ...posting, likes });
        }
      } else {
        // 回滾樂觀更新
        setIsLiked(wasLiked);
        if (posting) {
          setPosting({ ...posting, likes: posting.likes + (wasLiked ? 1 : -1) });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // 回滾樂觀更新
      setIsLiked(wasLiked);
      if (posting) {
        setPosting({ ...posting, likes: posting.likes + (wasLiked ? 1 : -1) });
      }
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這則徵人訊息嗎？')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/tutoring');
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('Error deleting posting:', error);
      alert('刪除時發生錯誤');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">載入中...</div>;
  }

  if (!posting) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">徵人訊息不存在</div>;
  }

  const isAuthor = session?.user?.id === posting.authorId._id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{posting.title}</h1>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                posting.type === 'seeking_tutor'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}
            >
              {posting.type === 'seeking_tutor' ? '徵家教' : '徵學生'}
            </span>
            {isAuthor && (
              <>
                <button
                  onClick={() => router.push(`/tutoring/${posting._id}/edit`)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                  title="編輯"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                  title="刪除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Link 
              href={`/profile/${posting.authorId._id}`}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {posting.authorId?.image ? (
                <Image
                  src={posting.authorId.image}
                  alt={posting.authorId.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white text-sm">
                  {getInitials(posting.authorId?.name || '匿名')}
                </div>
              )}
              <span>{posting.authorId?.name || '匿名'}</span>
            </Link>
            <span>發布時間: {new Date(posting.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''
              }`}
            />
            <span>{posting.likes || 0}</span>
          </button>
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
    </div>
  );
}


