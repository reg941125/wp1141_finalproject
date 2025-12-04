'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface JobPosting {
  _id: string;
  type: 'seeking_tutor' | 'seeking_student';
  title: string;
  description: string;
  tags: string[];
  educationLevel: 'elementary' | 'middle' | 'high' | 'university';
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
  const { data: session } = useSession();
  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPosting();
    }
  }, [params.id]);

  const fetchPosting = async () => {
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
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">載入中...</div>;
  }

  if (!posting) {
    return <div className="max-w-4xl mx-auto px-4 py-8">徵人訊息不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{posting.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              posting.type === 'seeking_tutor'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {posting.type === 'seeking_tutor' ? '徵家教' : '徵學生'}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <span>發布者: {posting.authorId?.name || '匿名'}</span>
          <span>發布時間: {new Date(posting.createdAt).toLocaleDateString('zh-TW')}</span>
        </div>

        <div className="flex space-x-2 mb-4">
          {posting.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-700">教育程度:</span>
            <span className="ml-2">{educationLevelMap[posting.educationLevel]}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">時薪:</span>
            <span className="ml-2">
              ${posting.hourlyRate.min}
              {posting.hourlyRate.max ? ` - $${posting.hourlyRate.max}` : ''}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">描述</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{posting.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">詳細要求</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{posting.requirements}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/profile/${posting.authorId._id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          查看發布者檔案 →
        </Link>
      </div>
    </div>
  );
}


