'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MarkdownEditor from '@/components/MarkdownEditor';
import Combobox from '@/components/Combobox';

const LEVEL_OPTIONS = [
  '國小',
  '國中',
  '高中',
  '大學',
  '研究所',
];

// 各教育級別對應的科目選項
const SUBJECT_OPTIONS_BY_LEVEL: Record<string, string[]> = {
  '國小': [
    '國語',
    '英文',
    '數學',
    '自然',
    '社會',
  ],
  '國中': [
    '國文',
    '英文',
    '數學',
    '生物',
    '理化',
    '地科',
    '歷史',
    '地理',
    '公民',
  ],
  '高中': [
    '國文',
    '英文',
    '數學',
    '物理',
    '化學',
    '生物',
    '地科',
    '歷史',
    '地理',
    '公民',
  ],
  '大學': [],
  '研究所': [],
  '其他': [],
};

export default function NewQuestionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [level, setLevel] = useState('');
  const [subject, setSubject] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // 根據選擇的年級動態獲取對應的科目選項
  const subjectOptions = useMemo(() => {
    if (level && SUBJECT_OPTIONS_BY_LEVEL[level]) {
      return SUBJECT_OPTIONS_BY_LEVEL[level];
    }
    // 如果沒有選擇年級或年級不在映射中，返回所有科目
    return SUBJECT_OPTIONS_BY_LEVEL['其他'];
  }, [level]);

  // 在檢查 session 時不顯示任何內容
  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
        載入中...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
        重定向中...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags: tagArray,
          level,
          subject,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/questions/${data._id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">發問</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            標題
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
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
                value={level}
                onChange={setLevel}
                options={LEVEL_OPTIONS}
                placeholder="程度"
                className="rounded-l-md sm:rounded-r-none rounded-r-md order-r-0"
              />
            </div>
            <div className="w-32 sm:w-36 flex-shrink-0">
              <Combobox
                value={subject}
                onChange={setSubject}
                options={subjectOptions}
                placeholder="科目"
                className="sm:rounded-none rounded-md border-r-0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md sm:rounded-l-none rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                placeholder="其他，例如：文言文、文法、三角函數、法律、反應速率......"
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
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? '發布中...' : '發布'}
          </button>
        </div>
      </form>
    </div>
  );
}


