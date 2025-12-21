'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
}

export default function EditJobPostingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posting, setPosting] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'seeking_tutor' as 'seeking_tutor' | 'seeking_student',
    title: '',
    tags: [] as string[],
    targetEducationLevels: [] as ('elementary' | 'middle' | 'high' | 'university')[],
    hourlyRateMin: '',
    hourlyRateMax: '',
    requirements: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [isRange, setIsRange] = useState(false);

  useEffect(() => {
    if (params.id && status === 'authenticated') {
      fetchPosting();
    }
  }, [params.id, status]);

  const fetchPosting = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPosting(data);
        setFormData({
          type: data.type,
          title: data.title,
          tags: data.tags,
          targetEducationLevels: data.targetEducationLevels,
          hourlyRateMin: data.hourlyRate.min.toString(),
          hourlyRateMax: data.hourlyRate.max ? data.hourlyRate.max.toString() : '',
          requirements: data.requirements,
        });
        setIsRange(!!data.hourlyRate.max);
      } else {
        router.push('/tutoring');
      }
    } catch (error) {
      console.error('Error fetching posting:', error);
      router.push('/tutoring');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        載入中...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        重定向中...
      </div>
    );
  }

  if (!posting) {
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        徵人訊息不存在
      </div>
    );
  }

  const isAuthor = session?.user?.id === posting.authorId._id.toString();
  if (!isAuthor) {
    router.push(`/tutoring/${params.id}`);
    return null;
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .split(/[,、]/)
        .map((t) => t.trim())
        .filter((t) => t && !formData.tags.includes(t));
      
      if (newTags.length > 0) {
        setFormData({
          ...formData,
          tags: [...formData.tags, ...newTags],
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(formData.hourlyRateMin);
    const max = isRange && formData.hourlyRateMax ? parseInt(formData.hourlyRateMax) : undefined;

    if (isNaN(min) || min < 0) {
      alert('請輸入有效的時薪');
      return;
    }

    if (isRange && max && max < min) {
      alert('最高時薪必須大於最低時薪');
      return;
    }

    if (formData.targetEducationLevels.length === 0) {
      alert('請至少選擇一個目標教育程度');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          tags: formData.tags,
          targetEducationLevels: formData.targetEducationLevels,
          hourlyRate: { min, max },
          requirements: formData.requirements,
        }),
      });

      if (response.ok) {
        router.push(`/tutoring/${params.id}`);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        alert('更新失敗');
      }
    } catch (error) {
      console.error('Error updating posting:', error);
      alert('更新時發生錯誤');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">編輯徵人訊息</h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 space-y-4 transition-colors">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            類型
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                value="seeking_tutor"
                checked={formData.type === 'seeking_tutor'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="mr-2"
              />
              徵家教
            </label>
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                value="seeking_student"
                checked={formData.type === 'seeking_student'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="mr-2"
              />
              徵學生
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            標題
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            目標教育程度（可多選）
          </label>
          <div className="space-y-2">
            {[
              { value: 'elementary', label: '國小' },
              { value: 'middle', label: '國中' },
              { value: 'high', label: '高中' },
              { value: 'university', label: '大學' },
            ].map((level) => (
              <label key={level.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.targetEducationLevels.includes(level.value as any)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        targetEducationLevels: [
                          ...formData.targetEducationLevels,
                          level.value as any,
                        ],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        targetEducationLevels: formData.targetEducationLevels.filter(
                          (l) => l !== level.value
                        ),
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            時薪
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isRange}
                onChange={(e) => setIsRange(e.target.checked)}
                className="mr-2"
              />
              時薪區間
            </label>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <input
              type="number"
              value={formData.hourlyRateMin}
              onChange={(e) => setFormData({ ...formData, hourlyRateMin: e.target.value })}
              placeholder="最低時薪"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              required
            />
            {isRange && (
              <input
                type="number"
                value={formData.hourlyRateMax}
                onChange={(e) => setFormData({ ...formData, hourlyRateMax: e.target.value })}
                placeholder="最高時薪"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            標籤
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="輸入標籤（用頓號或逗號分隔）後按 Enter"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              新增
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            詳細要求
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) =>
              setFormData({ ...formData, requirements: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            rows={6}
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/tutoring/${params.id}`)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </form>
    </div>
  );
}

