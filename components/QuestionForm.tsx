'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '@/components/MarkdownEditor';
import Combobox from '@/components/Combobox';
import { Paperclip, X } from 'lucide-react';
import Image from 'next/image';

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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步初始值的变化（用于编辑模式）
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setTags(initialTags);
    setLevelTag(initialLevel);
  }, [initialTitle, initialContent, initialTags, initialLevel]);

  // 處理檔案上傳
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { urls } = await response.json();
        
        // 將上傳的檔案添加到列表
        const newFiles = Array.from(files).map((file, index) => ({
          url: urls[index],
          name: file.name,
          type: file.type,
        }));
        setUploadedFiles([...uploadedFiles, ...newFiles]);

        // 將檔案添加到內容末尾
        let newContent = content;
        newFiles.forEach((file) => {
          if (file.type.startsWith('image/')) {
            // 圖片使用 markdown 圖片語法
            newContent += `\n![${file.name}](${file.url})\n`;
          } else {
            // 其他檔案使用下載連結
            newContent += `\n[📎 ${file.name}](${file.url})\n`;
          }
        });
        setContent(newContent);
      } else {
        alert('檔案上傳失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('檔案上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      // 清除 input 以允許重複上傳同一檔案
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 移除已上傳的檔案
  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // 從內容中移除對應的 markdown
    let newContent = content;
    if (fileToRemove.type.startsWith('image/')) {
      newContent = newContent.replace(`![${fileToRemove.name}](${fileToRemove.url})`, '');
    } else {
      newContent = newContent.replace(`[📎 ${fileToRemove.name}](${fileToRemove.url})`, '');
    }
    // 清理多餘的換行
    newContent = newContent.replace(/\n{3,}/g, '\n\n').trim();
    setContent(newContent);
    
    // 從列表中移除
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            內容
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="上傳檔案"
          >
            <Paperclip className="w-4 h-4" />
            {uploading ? '上傳中...' : '上傳檔案'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
        </div>

        {/* 已上傳的檔案列表 */}
        {uploadedFiles.length > 0 && (
          <div className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              已上傳的檔案：
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                >
                  {file.type.startsWith('image/') ? (
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                      <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {file.type.startsWith('image/') ? '圖片' : '檔案'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="移除檔案"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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

