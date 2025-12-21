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

  useEffect(() => {
    if (params.id) {
      fetchPost();
      fetchAnswers();
    }
  }, [params.id]);

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
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
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
            <div className="flex space-x-2 ml-4">
              <Link
                href={`/questions/${params.id}/edit`}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                編輯
              </Link>
              <button
                onClick={handleDeletePost}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                刪除
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{post.authorId?.name || '匿名'}</span>
            <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <HiEye className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <IoMdThumbsUp className="w-4 h-4" />
              <span>{post.likes}</span>
            </div>
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
                  <span className="font-medium text-gray-900 dark:text-gray-100">{answer.authorId?.name || '匿名'}</span>
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
                  <button className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <IoMdThumbsUp className="w-4 h-4" />
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


