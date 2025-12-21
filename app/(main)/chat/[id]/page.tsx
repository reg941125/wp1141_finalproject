'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to new format with query parameter
    router.replace(`/chat?id=${params.id}`);
  }, [params.id, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-gray-900 dark:text-white">重定向中...</div>
    </div>
  );
}
