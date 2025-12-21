'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  image?: string;
  bannerImage?: string;
  bio?: string;
  teachingExperience?: string;
  educationLevel?: 'elementary' | 'middle' | 'high' | 'university' | 'graduate' | 'other';
}

interface QuestionFile {
  _id: string;
  name: string;
  description: string;
  content: string;
  showOnProfile: boolean;
}

interface JobPosting {
  _id: string;
  type: 'seeking_tutor' | 'seeking_student';
  title: string;
  description: string;
  tags: string[];
  targetEducationLevels: ('elementary' | 'middle' | 'high' | 'university')[];
  hourlyRate: {
    min: number;
    max?: number;
  };
  isActive: boolean;
}

const educationLevelMap = {
  elementary: '國小',
  middle: '國中',
  high: '高中',
  university: '大學',
  graduate: '研究所',
  other: '其他',
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [questionFiles, setQuestionFiles] = useState<QuestionFile[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId]);

  const fetchProfile = async () => {
    try {
      const [userRes, filesRes, jobsRes, followersRes, followStatusRes] = await Promise.all([
        fetch(`/api/users/${params.userId}`),
        fetch(`/api/questions?userId=${params.userId}`),
        fetch(`/api/jobs?userId=${params.userId}`),
        fetch(`/api/users/${params.userId}/followers`),
        session ? fetch(`/api/users/${params.userId}/follow`) : Promise.resolve(null),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setQuestionFiles(filesData.filter((f: QuestionFile) => f.showOnProfile));
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobPostings(jobsData.filter((j: JobPosting) => j.isActive));
      }

      if (followersRes.ok) {
        const followData = await followersRes.json();
        setFollowersCount(followData.followersCount || 0);
        setFollowingCount(followData.followingCount || 0);
      }

      if (followStatusRes && followStatusRes.ok) {
        const statusData = await followStatusRes.json();
        setIsFollowing(statusData.following || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 處理追蹤/取消追蹤
  const handleFollow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${params.userId}/follow`, {
        method,
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // 處理私訊
  const handleMessage = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      // 創建或獲取對話
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: params.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // API 返回的對話對象中包含 _id 字段
        router.push(`/chat/${data._id}`);
      } else {
        console.error('Failed to create/get conversation');
        alert('無法開啟對話，請稍後再試');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('無法開啟對話，請稍後再試');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">載入中...</div>;
  }

  if (!user) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">用戶不存在</div>;
  }

  const isOwnProfile = session?.user?.id === params.userId || session?.user?.id === user._id;
  const handle = user.username ? `@${user.username}` : (user.email ? `@${user.email.split('@')[0]}` : '@user');
  
  // 生成頭像縮寫（如果沒有圖片）
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-screen transition-colors">
      {/* Banner/Header Area */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full relative">
        {user.bannerImage && (
          <Image
            src={user.bannerImage}
            alt="Banner"
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      
      {/* Profile Section */}
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          {/* Profile Picture - overlapping banner */}
          <div className="relative -mt-20 mb-4">
            {user.image ? (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-600 overflow-hidden">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-pink-500 dark:bg-pink-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                編輯個人檔案
              </Link>
            ) : (
              <>
                {/* 追蹤按鈕 */}
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isFollowing
                      ? 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-600'
                      : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {followLoading ? '處理中...' : isFollowing ? '追蹤中' : '追蹤'}
                </button>

                {/* 私訊按鈕 */}
                <button
                  onClick={handleMessage}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  私訊
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{handle}</p>
          
          {/* Bio */}
          <div className="mt-4">
            {user.bio ? (
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No bio yet.</p>
            )}
          </div>

          {/* Education Level */}
          {user.educationLevel && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">目前的教育程度：</span>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                {educationLevelMap[user.educationLevel]}
              </span>
            </div>
          )}

          {/* Following/Followers */}
          <div className="flex space-x-4 mt-4">
            <span className="text-gray-900 dark:text-white">
              <span className="font-semibold">{followingCount}</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">Following</span>
            </span>
            <span className="text-gray-900 dark:text-white">
              <span className="font-semibold">{followersCount}</span>{' '}
              <span className="text-gray-500 dark:text-gray-400">Followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Teaching Experience */}
      {user.teachingExperience && (
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">教學經歷</h2>
          <div className="prose max-w-none text-gray-900 dark:text-white">
            <MarkdownRenderer content={user.teachingExperience} />
          </div>
        </div>
      )}

      {/* Question Files */}
      {questionFiles.length > 0 && (
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">題目與考卷</h2>
          <div className="space-y-3">
            {questionFiles.map((file) => (
              <Link
                key={file._id}
                href={`/library/edit/${file._id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{file.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{file.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Job Postings */}
      {jobPostings.length > 0 && (
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">徵人訊息</h2>
          <div className="space-y-3">
            {jobPostings.map((posting) => (
              <Link
                key={posting._id}
                href={`/tutoring/${posting._id}`}
                className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{posting.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      posting.type === 'seeking_tutor'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {posting.type === 'seeking_tutor' ? '徵家教' : '徵學生'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                  {posting.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    目標: {posting.targetEducationLevels?.length > 0 
                      ? posting.targetEducationLevels.map(level => educationLevelMap[level as keyof typeof educationLevelMap]).join('、')
                      : '未指定'}
                  </span>
                  <span>
                    時薪: ${posting.hourlyRate.min}
                    {posting.hourlyRate.max ? ` - $${posting.hourlyRate.max}` : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {questionFiles.length === 0 && jobPostings.length === 0 && !user.teachingExperience && (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
          <p>尚無內容</p>
        </div>
      )}
    </div>
  );
}

