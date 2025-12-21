'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuestionForm from '@/components/QuestionForm';

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  level?: string;
  subject?: string;
  authorId: {
    _id: string;
    name: string;
  };
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id && status === 'authenticated') {
      fetchPost();
    }
  }, [params.id, status]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // 在檢查 session 時不顯示任何內容
  if (status === 'loading' || loading) {
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        載入中...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        重定向中...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 py-8 text-gray-900 dark:text-white">
        題目不存在
      </div>
    );
  }

  // 檢查是否為作者
  const isAuthor = session?.user?.id === post.authorId._id.toString();
  if (!isAuthor) {
    router.push(`/questions/${params.id}`);
    return null;
  }

  const handleSubmit = async (data: {
    title: string;
    content: string;
    tags: string[];
    level: string;
  }) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/questions/${params.id}`);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">編輯題目</h1>
      <QuestionForm
        initialTitle={post.title}
        initialContent={post.content}
        initialTags={post.tags.join('、')}
        initialLevel={post.level || ''}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/questions/${params.id}`)}
        submitLabel="儲存"
        cancelLabel="取消"
        submitting={saving}
      />
    </div>
  );
}

