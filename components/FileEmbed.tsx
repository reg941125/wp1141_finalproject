'use client';

import { useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface FileEmbedProps {
  url: string;
  fileName: string;
}

export default function FileEmbed({ url, fileName }: FileEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 判斷檔案類型
  const getFileType = (url: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const urlLower = url.toLowerCase();
    
    if (extension === 'pdf' || urlLower.includes('.pdf')) {
      return 'pdf';
    }
    if (['doc', 'docx'].includes(extension) || urlLower.includes('.doc')) {
      return 'doc';
    }
    if (['xls', 'xlsx'].includes(extension) || urlLower.includes('.xls')) {
      return 'excel';
    }
    if (['ppt', 'pptx'].includes(extension) || urlLower.includes('.ppt')) {
      return 'ppt';
    }
    if (['txt', 'md'].includes(extension)) {
      return 'text';
    }
    return 'other';
  };

  const fileType = getFileType(url, fileName);

  // PDF 可以直接用 iframe 顯示
  const canEmbed = fileType === 'pdf';

  // 對於 Word、Excel、PPT，使用 Google Docs Viewer 或 Office Online Viewer
  const getViewerUrl = () => {
    if (fileType === 'pdf') {
      return url;
    }
    // 使用 Google Docs Viewer 來顯示 Office 文件
    if (['doc', 'excel', 'ppt'].includes(fileType)) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return null;
  };

  const viewerUrl = getViewerUrl();

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* 檔案資訊標題欄 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {fileName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {fileType === 'pdf' ? 'PDF' : 
             fileType === 'doc' ? 'Word' :
             fileType === 'excel' ? 'Excel' :
             fileType === 'ppt' ? 'PowerPoint' :
             fileType === 'text' ? '文字檔' : '檔案'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="在新分頁開啟"
          >
            <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </a>
          <a
            href={url}
            download={fileName}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="下載檔案"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </a>
        </div>
      </div>

      {/* 檔案預覽區域 */}
      {viewerUrl ? (
        <div className="relative" style={{ height: '600px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">載入中...</p>
              </div>
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center px-4">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  無法預覽此檔案
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  點擊此處在新分頁開啟
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={viewerUrl}
              className="w-full h-full"
              onLoad={handleLoad}
              onError={handleError}
              title={fileName}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      ) : (
        // 無法內嵌的檔案類型
        <div className="flex items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              此檔案類型無法預覽
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                在新分頁開啟
              </a>
              <a
                href={url}
                download={fileName}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                下載檔案
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

