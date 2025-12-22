'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Globe } from 'lucide-react';

interface LinkMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
  siteName?: string;
  favicon?: string;
}

interface ExternalLinkPreviewProps {
  url: string;
}

export default function ExternalLinkPreview({ url }: ExternalLinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching link preview:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className="my-4 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
      </div>
    );
  }

  if (error || !metadata) {
    // 顯示簡單的鏈接
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ExternalLink size={14} />
        {url}
      </a>
    );
  }

  return (
    <a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-4 block border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
    >
      {metadata.image && (
        <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
          <Image
            src={metadata.image}
            alt={metadata.title}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              // 圖片載入失敗時隱藏
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        {/* 網站名稱和 favicon */}
        <div className="flex items-center gap-2 mb-2">
          {metadata.favicon ? (
            <Image
              src={metadata.favicon}
              alt=""
              width={16}
              height={16}
              className="rounded"
              unoptimized
              onError={(e) => {
                // Favicon 載入失敗時顯示預設圖標
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <Globe size={16} className="text-gray-500 dark:text-gray-400" />
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {metadata.siteName || new URL(metadata.url).hostname}
          </span>
        </div>

        {/* 標題 */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {metadata.title}
        </h3>

        {/* 描述 */}
        {metadata.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
            {metadata.description}
          </p>
        )}

        {/* URL */}
        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <ExternalLink size={12} />
          <span className="truncate">{metadata.url}</span>
        </div>
      </div>
    </a>
  );
}

