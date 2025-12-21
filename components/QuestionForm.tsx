'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import Combobox from '@/components/Combobox';

const LEVEL_OPTIONS = [
  '國小',
  '國中',
  '高中',
  '大學',
  '研究所',
];

interface QuestionFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string;
  initialLevel?: string;
  onSubmit: (data: {
    title: string;
    content: string;
    tags: string[];
    level: string;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
}

export default function QuestionForm({
  initialTitle = '',
  initialContent = '',
  initialTags = '',
  initialLevel = '',
  onSubmit,
  onCancel,
  submitLabel = '發布',
  cancelLabel = '取消',
  submitting = false,
}: QuestionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags);
  const [levelTag, setLevelTag] = useState(initialLevel);

  // 同步初始值的变化（用于编辑模式）
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTags(initialTags);
    setLevelTag(initialLevel);
  }, [initialTitle, initialContent, initialTags, initialLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tagArray = tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean);
    const submitData = {
      title,
      content,
      tags: tagArray,
      level: levelTag || '',
    };
    await onSubmit(submitData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          標題
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-[-2px] focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          placeholder="請輸入題目標題"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          標籤
        </label>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="w-24 sm:w-28 flex-shrink-0">
            <Combobox
              value={levelTag}
              onChange={setLevelTag}
              options={LEVEL_OPTIONS}
              placeholder="程度"
              className="rounded-l-md rounded-r-md sm:rounded-r-none"
            />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md rounded-r-md sm:rounded-l-none focus:outline focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-[-2px] focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              placeholder="其他（用頓號或逗號分隔），例如：文言文、文法、三角函數......"
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          內容
        </label>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="輸入題目內容..."
        />
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {submitting ? '發布中...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

