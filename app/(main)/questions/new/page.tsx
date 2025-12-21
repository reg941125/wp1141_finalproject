'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuestionForm from '@/components/QuestionForm';

export default function NewQuestionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [submitting, setSubmitting] = useState(false);

  // 在檢查 session 時不顯示任何內容
  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
        載入中...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
        重定向中...
      </div>
    );
  }

  const handleSubmit = async (data: {
    title: string;
    content: string;
    tags: string[];
    level: string;
    subject: string;
  }) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/questions/${result._id}`);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">發問</h1>
      <QuestionForm
        onSubmit={handleSubmit}
        submitLabel="發布"
        submitting={submitting}
      />
    </div>
  );
}
