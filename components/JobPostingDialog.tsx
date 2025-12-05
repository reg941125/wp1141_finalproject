'use client';

import { useState } from 'react';

interface JobPostingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingData) => void;
}

export interface JobPostingData {
  type: 'seeking_tutor' | 'seeking_student';
  title: string;
  tags: string[];
  targetEducationLevels: ('elementary' | 'middle' | 'high' | 'university')[];
  hourlyRate: {
    min: number;
    max?: number;
  };
  requirements: string;
}

export default function JobPostingDialog({
  isOpen,
  onClose,
  onSubmit,
}: JobPostingDialogProps) {
  const [formData, setFormData] = useState<JobPostingData>({
    type: 'seeking_tutor',
    title: '',
    tags: [],
    targetEducationLevels: [],
    hourlyRate: { min: 0 },
    requirements: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');
  const [isRange, setIsRange] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(hourlyRateMin);
    const max = isRange && hourlyRateMax ? parseInt(hourlyRateMax) : undefined;

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

    onSubmit({
      ...formData,
      hourlyRate: { min, max },
    });

    // Reset form
    setFormData({
      type: 'seeking_tutor',
      title: '',
      tags: [],
      targetEducationLevels: [],
      hourlyRate: { min: 0 },
      requirements: '',
    });
    setTagInput('');
    setHourlyRateMin('');
    setHourlyRateMax('');
    setIsRange(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">發布徵人訊息</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                類型
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
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
                <label className="flex items-center">
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
                <label className="flex items-center">
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
                  value={hourlyRateMin}
                  onChange={(e) => setHourlyRateMin(e.target.value)}
                  placeholder="最低時薪"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                  required
                />
                {isRange && (
                  <input
                    type="number"
                    value={hourlyRateMax}
                    onChange={(e) => setHourlyRateMax(e.target.value)}
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
                  placeholder="輸入標籤後按 Enter"
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
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                發布
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


