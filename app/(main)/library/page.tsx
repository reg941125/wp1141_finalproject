'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface QuestionFile {
  _id: string;
  name: string;
  description: string;
  fileUrl?: string;
  authorId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function LibraryPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<QuestionFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">題目與筆記專區</h1>
        {session && (
          <div className="flex space-x-4">
            <Link
              href="/library/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              上傳題目
            </Link>
          </div>
        )}
      </div>

      {session && (
        <div className="mb-6">
          <Link
            href="/library/my-files"
            className="text-blue-600 hover:text-blue-800"
          >
            查看我的題目 →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          尚無題目檔案
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <Link
              key={file._id}
              href={`/library/edit/${file._id}`}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {file.name}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {file.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{file.authorId?.name || '匿名'}</span>
                <span>{new Date(file.createdAt).toLocaleDateString('zh-TW')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


