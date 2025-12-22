'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutoringPage() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到徵學生頁面作為默認頁面
    router.replace('/tutoring/seeking-students');
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12 text-gray-700 dark:text-gray-300">
        正在導向...
      </div>
    </div>
  );
}
