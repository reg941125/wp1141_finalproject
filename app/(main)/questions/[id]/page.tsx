'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MarkdownEditor from '@/components/MarkdownEditor';
import Image from 'next/image';
import { HiEye } from 'react-icons/hi';
import { IoMdThumbsUp, IoMdShare } from 'react-icons/io';
import { BiSolidMessageCheck } from 'react-icons/bi';
import { Edit, Trash2, Paperclip, X } from 'lucide-react';

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
  const [answerFiles, setAnswerFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likingAnswers, setLikingAnswers] = useState<Set<string>>(new Set());
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [deletingAnswers, setDeletingAnswers] = useState<Set<string>>(new Set());
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState<{ type: 'post' | 'answer'; id: string } | null>(null);
  const [likeUsers, setLikeUsers] = useState<Array<{
    _id: string;
    name: string;
    image?: string;
    customImage?: string;
    username?: string;
  }>>([]);
  const [copied, setCopied] = useState(false);

  const userId = session?.user?.id;
  const userIdRef = useRef(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answerSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (params.id) {
      const loadData = async () => {
        await fetchPost();
        const answersData = await fetchAnswers();
        // 獲取按讚狀態
        const currentUserId = session?.user?.id;
        if (currentUserId) {
          const answerIds = answersData.map((answer: Answer) => answer._id);
          await fetchLikeStatus(answerIds);
        }
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // 只在 userId 真正改變時（登入/登出）才重新獲取
  useEffect(() => {
    if (userIdRef.current !== userId && params.id) {
      userIdRef.current = userId;
      const loadData = async () => {
        await fetchPost(false);
        const answersData = await fetchAnswers();
        const currentUserId = session?.user?.id;
        if (currentUserId) {
          const answerIds = answersData.map((answer: Answer) => answer._id);
          await fetchLikeStatus(answerIds);
        }
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 檢測 URL hash，如果是 #answer 則滾動到留言區並聚焦輸入框
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#answer' && !loading && post) {
      setShouldAutoFocus(true);
      // 等待頁面渲染完成
      const timer = setTimeout(() => {
        if (answerSectionRef.current) {
          answerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [post, loading]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const { urls } = await response.json();
        
        // 將上傳的檔案添加到列表
        const newFiles = Array.from(files).map((file, index) => ({
          url: urls[index],
          name: file.name,
          type: file.type,
        }));
        setAnswerFiles([...answerFiles, ...newFiles]);

        // 將檔案添加到內容末尾
        let newContent = answerContent;
        newFiles.forEach((file) => {
          if (file.type.startsWith('image/')) {
            // 圖片使用 markdown 圖片語法
            newContent += `\n![${file.name}](${file.url})\n`;
          } else {
            // 其他檔案使用內嵌連結（會被 MarkdownRenderer 解析為 FileEmbed）
            newContent += `\n[📎 ${file.name}](${file.url})\n`;
          }
        });
        setAnswerContent(newContent);
      } else {
        alert('檔案上傳失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('檔案上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = answerFiles[index];
    
    // 從內容中移除對應的 markdown
    let newContent = answerContent;
    if (fileToRemove.type.startsWith('image/')) {
      newContent = newContent.replace(`![${fileToRemove.name}](${fileToRemove.url})`, '');
    } else {
      newContent = newContent.replace(`[📎 ${fileToRemove.name}](${fileToRemove.url})`, '');
    }
    // 清理多餘的換行
    newContent = newContent.replace(/\n{3,}/g, '\n\n').trim();
    setAnswerContent(newContent);
    
    // 從列表中移除
    setAnswerFiles(answerFiles.filter((_, i) => i !== index));
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
        setAnswerFiles([]);
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

  // 獲取點讚用戶列表
  const handleShowLikes = async (type: 'post' | 'answer', id: string) => {
    try {
      let url = '';
      if (type === 'post') {
        url = `/api/posts/${id}/likes`;
      } else {
        url = `/api/answers/${id}/likes`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLikeUsers(data.users || []);
        setShowLikesModal({ type, id });
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  // 處理分享（複製網址）
  const handleShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${baseUrl}/questions/${params.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('複製失敗，請稍後再試');
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
              {(post.authorId?.customImage || post.authorId?.image) ? (
                <Image
                  src={post.authorId.customImage || post.authorId.image}
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
              <div>
                {/* 統計數據：桌面版顯示在一行 */}
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
                  {/* 桌面版：分享按鈕 */}
                  <button
                    onClick={handleShare}
                    className="hidden sm:flex items-center space-x-1 relative transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    title="分享貼文"
                  >
                    <IoMdShare className="w-4 h-4" />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        已複製連結！
                      </span>
                    )}
                  </button>
                </div>
                {/* 第二行：查看點讚和分享（手機版） */}
                <div className="flex items-center gap-3 mt-2">
                  {post.likes > 0 && (
                    <button
                      onClick={() => handleShowLikes('post', post._id)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                    >
                      查看點讚
                    </button>
                  )}
                  {/* 手機版：分享按鈕 */}
                  <button
                    onClick={handleShare}
                    className="sm:hidden flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 relative"
                    title="分享貼文"
                  >
                    <IoMdShare className="w-3.5 h-3.5" />
                    <span>分享</span>
                    {copied && (
                      <span className="absolute -top-8 left-0 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        已複製連結！
                      </span>
                    )}
                  </button>
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
                    {(answer.authorId?.customImage || answer.authorId?.image) ? (
                      <Image
                        src={answer.authorId.customImage || answer.authorId.image}
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
                    <div>
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
                      {answer.likes > 0 && (
                        <button
                          onClick={() => handleShowLikes('answer', answer._id)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:underline mt-2"
                        >
                          查看點讚
                        </button>
                      )}
                    </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {session && (
        <div 
          ref={answerSectionRef}
          id="answer"
          className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">回答問題</h2>
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  解答內容
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="上傳檔案"
                >
                  <Paperclip className="w-4 h-4" />
                  {uploading ? '上傳中...' : '上傳檔案'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                />
              </div>

              {/* 已上傳的檔案列表 */}
              {answerFiles.length > 0 && (
                <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    已上傳的檔案：
                  </div>
                  <div className="space-y-2">
                    {answerFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                      >
                        {file.type.startsWith('image/') ? (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover rounded"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                            <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {file.type.startsWith('image/') ? '圖片' : '檔案'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="移除檔案"
                        >
                          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <MarkdownEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="輸入您的解答..."
                autoFocus={shouldAutoFocus}
              />
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

      {/* 點讚用戶對話框 */}
      {showLikesModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLikesModal(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 標題 */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                點讚的人
              </h2>
              <button
                onClick={() => setShowLikesModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 用戶列表 */}
            <div className="overflow-y-auto flex-1">
              {likeUsers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  還沒有人點讚
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {likeUsers.map((user) => (
                    <Link
                      key={user._id}
                      href={`/profile/${user._id}`}
                      onClick={() => setShowLikesModal(null)}
                      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {(user.customImage || user.image) && (
                          <Image
                            src={user.customImage || user.image || ''}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="text-white text-sm font-bold absolute">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        {user.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


