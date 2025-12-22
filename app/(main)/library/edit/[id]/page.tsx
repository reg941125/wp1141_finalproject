'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import MarkdownEditor from '@/components/MarkdownEditor';
import { getPreviewUrl } from '@/lib/cloudinary-utils';

interface QuestionFile {
  _id: string;
  authorId: {
    _id: string;
    name: string;
  };
  name: string;
  description: string;
  fileUrl?: string;
  content: string;
  showOnProfile: boolean;
  subject: string;
  difficulty: string;
  tags: string[];
  isPublic: boolean;
}

const SUBJECTS = ['數學', '物理', '化學', '生物', '國文', '英文', '歷史', '地理', '公民', '其他'];
const DIFFICULTIES = ['簡單', '中等', '困難'];

export default function EditFilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [file, setFile] = useState<QuestionFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('其他');
  const [difficulty, setDifficulty] = useState('中等');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showOnProfile, setShowOnProfile] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const fetchFile = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFile(data);
        setName(data.name);
        setDescription(data.description);
        setSubject(data.subject || '其他');
        setDifficulty(data.difficulty || '中等');
        setTags(data.tags?.join(', ') || '');
        setContent(data.content || '');
        setIsPublic(data.isPublic !== undefined ? data.isPublic : true);
        setShowOnProfile(data.showOnProfile || false);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchFile();
    }
  }, [params.id, fetchFile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', selectedFile);

      const response = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.urls && data.urls.length > 0) {
          // 更新檔案 URL
          setFile({ ...file!, fileUrl: data.urls[0] });
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !description) {
      alert('請填寫名稱和描述');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name,
        description,
        subject,
        difficulty,
        tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
        content,
        isPublic,
        showOnProfile,
      };

      if (file?.fileUrl) {
        updateData.fileUrl = file.fileUrl;
      }

      const response = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push(`/library/view/${params.id}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-900 dark:text-white">載入中...</div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">找不到此題目或筆記</p>
          <button
            onClick={() => router.push('/library')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            返回題目與筆記專區
          </button>
        </div>
      </div>
    );
  }

  if (session?.user?.id !== file.authorId._id) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">您沒有權限編輯此題目或筆記</p>
          <button
            onClick={() => router.push('/library')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            返回題目與筆記專區
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
        >
          ← 返回
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">編輯題目/筆記</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              名稱 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              描述 *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                科目
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                難度
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              標籤（用逗號分隔）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: 微積分, 練習題, 考古題"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              上傳檔案（選填）
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fileUploading && <p className="text-sm text-gray-500 mt-1">上傳中...</p>}
            {file.fileUrl && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                目前檔案: <a href={getPreviewUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer" className="underline">查看</a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              內容（選填，支援 Markdown）
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="輸入內容..."
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">公開分享</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnProfile}
                onChange={(e) => setShowOnProfile(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">顯示在個人檔案</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
