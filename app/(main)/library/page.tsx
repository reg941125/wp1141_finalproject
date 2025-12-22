'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MarkdownEditor from '@/components/MarkdownEditor';

interface QuestionFile {
  _id: string;
  authorId: {
    _id: string;
    name: string;
    image?: string;
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
  createdAt: string;
  updatedAt: string;
}

const SUBJECTS = ['數學', '物理', '化學', '生物', '國文', '英文', '歷史', '地理', '公民', '其他'];
const DIFFICULTIES = ['簡單', '中等', '困難'];

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<QuestionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      // 始終獲取所有檔案來收集所有標籤
      const allResponse = await fetch('/api/questions');
      if (allResponse.ok) {
        const allData = await allResponse.json();
        
        // 收集所有標籤
        const tags = new Set<string>();
        allData.forEach((file: QuestionFile) => {
          file.tags?.forEach((tag: string) => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
      }

      // 獲取篩選後的檔案
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedDifficulty, selectedTag, searchQuery]);

  // 當認證狀態或篩選條件改變時重新載入
  useEffect(() => {
    if (status === 'authenticated') {
      fetchFiles();
    }
  }, [status, fetchFiles, selectedSubject, selectedDifficulty, selectedTag, searchQuery]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  const handleDownload = (file: QuestionFile) => {
    if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    } else {
      // 如果沒有檔案 URL，可以下載內容為文字檔
      const blob = new Blob([file.content || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-900 dark:text-white">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 標題和操作區 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            題目與筆記專區
          </h1>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            上傳題目/筆記
          </button>
        </div>

        {/* 搜尋和篩選 */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="搜尋題目或筆記..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 科目篩選 */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">科目篩選</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubject('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSubject === ''
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                全部
              </button>
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedSubject === subject
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* 難度篩選 */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">難度篩選</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedDifficulty === ''
                    ? 'bg-green-600 dark:bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                全部
              </button>
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'bg-green-600 dark:bg-green-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* 標籤篩選 */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">標籤篩選</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === ''
                    ? 'bg-purple-600 dark:bg-purple-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-purple-600 dark:bg-purple-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 題目/筆記列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">載入中...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            目前沒有可用的題目或筆記
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <Link
                  href={`/profile/${file.authorId._id}`}
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(file.authorId.customImage || file.authorId.image) && (
                    <Image
                      src={file.authorId.customImage || file.authorId.image}
                      alt={file.authorId.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    {file.authorId.name}
                  </span>
                </Link>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {file.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {file.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {file.subject}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded">
                  {file.difficulty}
                </span>
                {file.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  下載
                </button>
                <Link
                  href={`/library/view/${file._id}`}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm text-center"
                >
                  查看
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上傳對話框 */}
      {showUploadDialog && (
        <UploadDialog
          onClose={() => {
            setShowUploadDialog(false);
            fetchFiles();
          }}
        />
      )}
    </div>
  );
}

// 上傳對話框組件
function UploadDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('其他');
  const [difficulty, setDifficulty] = useState('中等');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showOnProfile, setShowOnProfile] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

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
          // 檔案上傳成功，URL 會在提交時使用
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    setSubmitting(true);
    try {
      let fileUrl = '';

      // 如果有選擇檔案，先上傳
      if (file) {
        const formData = new FormData();
        formData.append('files', file);

        const uploadResponse = await fetch('/api/questions/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.urls && uploadData.urls.length > 0) {
            fileUrl = uploadData.urls[0];
          }
        }
      }

      // 創建題目/筆記
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          fileUrl,
          content,
          subject,
          difficulty,
          tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
          isPublic,
          showOnProfile,
        }),
      });

      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating file:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              上傳題目/筆記
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {uploading && <p className="text-sm text-gray-500 mt-1">上傳中...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                內容（選填，支援 Markdown）
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="開始撰寫您的筆記...&#10;&#10;支援 Markdown 語法：&#10;- 標題：使用 # ## ###&#10;- 列表：使用 - 或 1.&#10;- 粗體：**文字**&#10;- 斜體：*文字*&#10;- 程式碼：`code` 或 ```code block```&#10;- LaTeX：使用 /in{...} 或 /block{...}"
                />
              </div>
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
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '上傳中...' : '上傳'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
