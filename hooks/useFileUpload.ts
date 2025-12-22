import { useState, useCallback } from 'react';

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

export function useFileUpload(apiEndpoint: string = '/api/questions/upload') {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<UploadedFile[]> => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();
      
      if (!data.urls || data.urls.length === 0) {
        throw new Error('未收到上傳的檔案 URL');
      }

      // 轉換為統一格式
      const uploadedFiles: UploadedFile[] = data.urls.map((url: string, index: number) => {
        const file = Array.from(files)[index];
        return {
          url,
          name: file.name,
          type: file.type,
        };
      });

      return uploadedFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上傳失敗';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [apiEndpoint]);

  return {
    uploading,
    uploadError,
    uploadFiles,
  };
}

