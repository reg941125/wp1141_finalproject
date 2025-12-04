'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
    username?: string;
  }>;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function ChatListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchConversations();
    fetchUnreadCounts();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchConversations();
      fetchUnreadCounts();
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch('/api/conversations/unread');
      if (response.ok) {
        const data = await response.json();
        setUnreadMap(data.byConversation || {});
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!session) return null;
    return conversation.participants.find(
      (p) => p._id !== session.user?.id
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-900 dark:text-white">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">訊息</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          尚無對話記錄
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
          {conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            if (!otherUser) return null;

            const isLastMessageByMe =
              conversation.lastMessageBy?._id === session?.user?.id;

            return (
              <Link
                key={conversation._id}
                href={`/chat/${conversation._id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {otherUser.image ? (
                      <img
                        src={otherUser.image}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 text-lg">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {otherUser.name}
                        </p>
                        {unreadMap[conversation._id] > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {unreadMap[conversation._id] > 99 ? '99+' : unreadMap[conversation._id]}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversation.lastMessageAt).toLocaleDateString(
                            'zh-TW',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p
                        className={`text-sm truncate ${
                          isLastMessageByMe ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300 font-medium'
                        }`}
                      >
                        {isLastMessageByMe && '你: '}
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

