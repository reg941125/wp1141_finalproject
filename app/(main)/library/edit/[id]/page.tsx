'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditPage() {
  const router = useRouter();

  // 自動重定向到主 library 頁面
  useEffect(() => {
    router.replace('/library');
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12 text-gray-900 dark:text-white">重定向中...</div>
    </div>
  );
}

