'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MarkdownEditor from '@/components/MarkdownEditor';
import Image from 'next/image';
import { HiEye } from 'react-icons/hi';
import { IoMdThumbsUp } from 'react-icons/io';
import { BiSolidMessageCheck } from 'react-icons/bi';
import { Edit, Trash2 } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  level?: string;
  subject?: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  views: number;
  likes: number;
}

interface Answer {
  _id: string;
  content: string;
  images: string[];
  authorId: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  likes: number;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likingAnswers, setLikingAnswers] = useState<Set<string>>(new Set());
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());

  const userId = session?.user?.id;

  useEffect(() => {
    if (params.id) {
      const loadData = async () => {
        await fetchPost();
        const answersData = await fetchAnswers();
        // 獲取按讚狀態
        if (userId) {
          const answerIds = answersData.map((answer: Answer) => answer._id);
          await fetchLikeStatus(answerIds);
        }
      };
      loadData();
    }
  }, [params.id, userId]);

  const fetchPost = async (incrementViews = true) => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        
        // Increment views only on initial load
        if (incrementViews) {
          await fetch(`/api/posts/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ views: data.views + 1 }),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/answers?postId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching answers:', error);
      return [];
    }
  };

  const fetchLikeStatus = async (answerIds: string[]) => {
    if (!session) return;
    try {
      const answerIdsParam = answerIds.join(',');
      const response = await fetch(
        `/api/posts/${params.id}/like-status?answerIds=${answerIdsParam}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsPostLiked(data.isPostLiked);
        setLikedAnswers(new Set(data.likedAnswerIds));
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnswerImages([...answerImages, ...data.urls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !answerContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: params.id,
          content: answerContent,
          images: answerImages,
        }),
      });

      if (response.ok) {
        setAnswerContent('');
        setAnswerImages([]);
        fetchAnswers();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('確定要刪除此題目嗎？')) return;

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLike = async () => {
    if (!session) {
      alert('請先登入才能按讚');
      return;
    }

    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/posts/${params.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setPost(prevPost => prevPost ? { ...prevPost, likes: data.likes } : null);
        setIsPostLiked(data.isLiked);
      } else {
        alert('操作失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setLiking(false);
    }
  };

  const handleAnswerLike = async (answerId: string) => {
    if (!session) {
      alert('請先登入才能按讚');
      return;
    }

    if (likingAnswers.has(answerId)) return;

    setLikingAnswers(prev => new Set(prev).add(answerId));
    try {
      const response = await fetch(`/api/answers/${answerId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers(prevAnswers =>
          prevAnswers.map(answer =>
            answer._id === answerId ? { ...answer, likes: data.likes } : answer
          )
        );
        // 更新按讚狀態
        setLikedAnswers(prev => {
          const newSet = new Set(prev);
          if (data.isLiked) {
            newSet.add(answerId);
          } else {
            newSet.delete(answerId);
          }
          return newSet;
        });
      } else {
        alert('操作失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setLikingAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
    }
  };

  const isAuthor = session?.user?.id === post?.authorId._id.toString();

  // 獲取程度標籤的顏色類名
  const getLevelColorClass = (level: string) => {
    const colorMap: Record<string, string> = {
      '國小': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      '國中': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      '高中': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      '大學': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      '研究所': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    };
    return colorMap[level] || 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">載入中...</div>;
  }

  if (!post) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">題目不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">{post.title}</h1>
          {isAuthor && (
            <div className="flex items-center space-x-2 ml-4">
              <Link
                href={`/questions/${params.id}/edit`}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                title="編輯"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDeletePost}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                title="刪除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <Link
              href={`/profile/${post.authorId?._id}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {post.authorId?.image ? (
                <Image
                  src={post.authorId.image}
                  alt={post.authorId.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                    {post.authorId?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <span className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400">
                {post.authorId?.name || '匿名'}
              </span>
            </Link>
            <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <HiEye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPostLiked
                      ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  title={isPostLiked ? '取消按讚' : '按讚'}
                >
                  <IoMdThumbsUp className={`w-4 h-4 ${isPostLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <BiSolidMessageCheck className="w-4 h-4" />
                  <span>{answers.length}</span>
                </div>
              </div>
        </div>
        {(() => {
          const level = post.level || '';
          const subject = post.subject || '';
          const tags = post.tags || [];
          const hasTags = (level && level.trim()) || (subject && subject.trim()) || (tags.length > 0);
          
          if (!hasTags) return null;
          
          return (
            <div className="flex space-x-2 mb-4 flex-wrap gap-2">
              {level && level.trim() && (
                <span
                  className={`px-2 py-1 rounded text-sm ${getLevelColorClass(level)}`}
                >
                  {level}
                </span>
              )}
              {subject && subject.trim() && (
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                  {subject}
                </span>
              )}
              {tags.length > 0 && tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          );
        })()}
        <div className="prose max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100"> 回答 ({answers.length})</h2>
        {answers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">尚未有人回答</p>
        ) : (
          <div className="space-y-6">
            {answers.map((answer) => (
              <div key={answer._id} className="border-b dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/profile/${answer.authorId?._id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {answer.authorId?.image ? (
                      <Image
                        src={answer.authorId.image}
                        alt={answer.authorId.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                          {answer.authorId?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {answer.authorId?.name || '匿名'}
                    </span>
                  </Link>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(answer.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div className="prose max-w-none mb-4">
                  <MarkdownRenderer content={answer.content} />
                </div>
                {answer.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {answer.images.map((url, idx) => (
                      <Image
                        key={idx}
                        src={url}
                        alt={`Answer image ${idx + 1}`}
                        width={400}
                        height={300}
                        className="rounded-lg"
                      />
                    ))}
                  </div>
                )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleAnswerLike(answer._id)}
                        disabled={likingAnswers.has(answer._id)}
                        className={`flex items-center space-x-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          likedAnswers.has(answer._id)
                            ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        title={likedAnswers.has(answer._id) ? '取消按讚' : '按讚'}
                      >
                        <IoMdThumbsUp className={`w-4 h-4 ${likedAnswers.has(answer._id) ? 'fill-current' : ''}`} />
                        <span>{answer.likes}</span>
                      </button>
                    </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {session && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">回答問題</h2>
          <form onSubmit={handleSubmitAnswer}>
            <MarkdownEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="輸入您的解答..."
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                上傳圖片
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition-colors"
              />
              {answerImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {answerImages.map((url, idx) => (
                    <div key={idx} className="relative">
                      <Image
                        src={url}
                        alt={`Upload ${idx + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setAnswerImages(answerImages.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !answerContent.trim()}
              className="mt-4 bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? '提交中...' : '提交解答'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


