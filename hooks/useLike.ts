import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseLikeOptions {
  entityType: 'post' | 'answer' | 'job';
  entityId: string;
  onSuccess?: (data: { likes: number; isLiked: boolean }) => void;
}

export function useLike({ entityType, entityId, onSuccess }: UseLikeOptions) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const getApiUrl = () => {
    switch (entityType) {
      case 'post':
        return `/api/posts/${entityId}/like`;
      case 'answer':
        return `/api/answers/${entityId}/like`;
      case 'job':
        return `/api/jobs/${entityId}/like`;
    }
  };

  const fetchLikeStatus = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(getApiUrl());
      if (response.ok) {
        const { liked } = await response.json();
        setIsLiked(liked);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  }, [entityId, session?.user?.id]);

  const toggleLike = useCallback(async () => {
    if (!session) {
      alert('請先登入才能按讚');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    // 樂觀更新
    const previousState = isLiked;
    setIsLiked(!isLiked);

    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        onSuccess?.(data);
      } else {
        // 失敗時恢復
        setIsLiked(previousState);
        alert('操作失敗，請稍後再試');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setIsLiked(previousState);
      alert('操作失敗，請稍後再試');
    } finally {
      setIsLiking(false);
    }
  }, [session, isLiking, isLiked, entityId, onSuccess]);

  return {
    isLiked,
    isLiking,
    toggleLike,
    fetchLikeStatus,
    setIsLiked,
  };
}

