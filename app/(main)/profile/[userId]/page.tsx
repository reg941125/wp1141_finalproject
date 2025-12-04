'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  educationLevel: string;
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
};

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [questionFiles, setQuestionFiles] = useState<QuestionFile[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId]);

  const fetchProfile = async () => {
    try {
      const [userRes, filesRes, jobsRes] = await Promise.all([
        fetch(`/api/users/${params.userId}`),
        fetch(`/api/questions?userId=${params.userId}`),
        fetch(`/api/jobs?userId=${params.userId}`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        // 暫時使用固定值，之後可以從 API 取得
        setFollowingCount(0);
        setFollowersCount(0);
      }

      if (filesRes.ok) {
        const filesData = await filesRes.json();
        setQuestionFiles(filesData.filter((f: QuestionFile) => f.showOnProfile));
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobPostings(jobsData.filter((j: JobPosting) => j.isActive));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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
          
          {/* Edit Profile Button */}
          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              編輯個人檔案
            </Link>
          )}
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
                  <span>{educationLevelMap[posting.educationLevel as keyof typeof educationLevelMap]}</span>
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

