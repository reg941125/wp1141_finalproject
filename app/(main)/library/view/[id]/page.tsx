'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { getDownloadUrl, getPreviewUrl } from '@/lib/cloudinary-utils';

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

export default function ViewFilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [file, setFile] = useState<QuestionFile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFile = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFile(data);
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

  const handleDownload = () => {
    if (file?.fileUrl) {
      // 使用 Cloudinary 的下載 URL（添加 fl_attachment 參數）
      const downloadUrl = getDownloadUrl(file.fileUrl);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (file?.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
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
          <Link
            href="/library"
            className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            返回題目與筆記專區
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === file.authorId._id;

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
        {/* 標題和作者資訊 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {file.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                {file.authorId.image && (
                  <Image
                    src={file.authorId.image}
                    alt={file.authorId.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <Link
                  href={`/profile/${file.authorId._id}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {file.authorId.name}
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(file.createdAt).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
            {isOwner && (
              <Link
                href={`/library/edit/${file._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                編輯
              </Link>
            )}
          </div>

          {/* 標籤 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
              {file.subject}
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
              {file.difficulty}
            </span>
            {file.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              下載
            </button>
            {file.fileUrl && (
              <a
                href={getPreviewUrl(file.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                在新分頁開啟檔案
              </a>
            )}
          </div>
        </div>

        {/* 描述 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">描述</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {file.description}
          </p>
        </div>

        {/* 內容 */}
        {file.content && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">內容</h2>
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={file.content} enableFileEmbed={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

