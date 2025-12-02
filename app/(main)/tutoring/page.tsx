'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import JobPostingDialog, { JobPostingData } from '@/components/JobPostingDialog';

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

export default function TutoringPage() {
  const { data: session } = useSession();
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'seeking_tutor' | 'seeking_student'>('all');
  const [tagFilter, setTagFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState<string>('all');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPostings();
  }, [typeFilter, tagFilter, educationFilter, hourlyRateMin, hourlyRateMax]);

  const fetchPostings = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (educationFilter !== 'all') params.append('educationLevel', educationFilter);
      if (hourlyRateMin) params.append('hourlyRateMin', hourlyRateMin);
      if (hourlyRateMax) params.append('hourlyRateMax', hourlyRateMax);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      setPostings(data);
    } catch (error) {
      console.error('Error fetching postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPosting = async (data: JobPostingData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchPostings();
      }
    } catch (error) {
      console.error('Error creating posting:', error);
    }
  };

  const allTags = Array.from(new Set(postings.flatMap((p) => p.tags)));

  const filteredPostings = postings.filter((posting) => {
    if (typeFilter !== 'all' && posting.type !== typeFilter) return false;
    if (tagFilter && !posting.tags.includes(tagFilter)) return false;
    if (educationFilter !== 'all' && posting.educationLevel !== educationFilter) return false;
    if (hourlyRateMin && posting.hourlyRate.min < parseInt(hourlyRateMin)) return false;
    if (hourlyRateMax && (posting.hourlyRate.max || posting.hourlyRate.min) > parseInt(hourlyRateMax)) return false;
    return posting.isActive;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">家教專區</h1>
        {session && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            發布徵人訊息
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">篩選條件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              類型
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="seeking_tutor">徵家教</option>
              <option value="seeking_student">徵學生</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              教育程度
            </label>
            <select
              value={educationFilter}
              onChange={(e) => setEducationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="elementary">國小</option>
              <option value="middle">國中</option>
              <option value="high">高中</option>
              <option value="university">大學</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最低時薪
            </label>
            <input
              type="number"
              value={hourlyRateMin}
              onChange={(e) => setHourlyRateMin(e.target.value)}
              placeholder="最低時薪"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最高時薪
            </label>
            <input
              type="number"
              value={hourlyRateMax}
              onChange={(e) => setHourlyRateMax(e.target.value)}
              placeholder="最高時薪"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            標籤
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter('')}
              className={`px-3 py-1 rounded-full text-sm ${
                tagFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  tagFilter === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : filteredPostings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          尚無符合條件的徵人訊息
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPostings.map((posting) => (
            <Link
              key={posting._id}
              href={`/tutoring/${posting._id}`}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {posting.title}
                </h2>
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
              <p className="text-gray-600 mb-4 line-clamp-2">
                {posting.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>{posting.authorId?.name || '匿名'}</span>
                  <span>{educationLevelMap[posting.educationLevel]}</span>
                  <span>
                    時薪: ${posting.hourlyRate.min}
                    {posting.hourlyRate.max
                      ? ` - $${posting.hourlyRate.max}`
                      : ''}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {posting.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <JobPostingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitPosting}
      />
    </div>
  );
}

