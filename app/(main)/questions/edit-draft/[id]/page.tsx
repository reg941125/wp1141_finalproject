'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuestionForm from '@/components/QuestionForm';

export default function EditDraftPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    fetchDraft();
  }, [status]);

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/posts/draft?id=${draftId}`);
      if (response.ok) {
        const data = await response.json();
        setDraft(data.draft);
      } else {
        alert('草稿不存在');
        router.push('/questions/drafts');
      }
    } catch (error) {
      console.error('Error fetching draft:', error);
      alert('載入草稿失敗');
      router.push('/questions/drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: {
    title: string;
    content: string;
    tags: string[];
    level: string;
  }) => {
    setSubmitting(true);
    try {
      // 將草稿發布為正式貼文
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isDraft: false }),
      });

      if (response.ok) {
        const result = await response.json();
        // 刪除草稿
        await fetch(`/api/posts/draft?id=${draftId}`, {
          method: 'DELETE',
        });
        router.push(`/questions/${result._id}`);
      } else {
        alert('發布失敗');
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('發布失敗');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">編輯草稿</h1>
      <QuestionForm
        draftId={draftId}
        initialTitle={draft.title}
        initialContent={draft.content}
        initialTags={draft.tags?.join(', ') || ''}
        initialLevel={draft.level || ''}
        onSubmit={handleSubmit}
        submitLabel="發布"
        submitting={submitting}
      />
    </div>
  );
}

