'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    image?: string;
    username?: string;
  };
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
    username?: string;
  }>;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    fetchMessages();
    
    // Poll for new messages every 2 seconds
    let previousMessageIds = new Set<string>();
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}/messages`);
        if (response.ok) {
          const data = await response.json();
          
          // Check for new messages
          if (previousMessageIds.size > 0 && document.hidden) {
            const newMessages = data.filter((msg: Message) => 
              !previousMessageIds.has(msg._id) && msg.senderId._id !== session?.user?.id
            );
            
            if (newMessages.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
              newMessages.forEach((msg: Message) => {
                new Notification(`${msg.senderId.name} 發送了一則訊息`, {
                  body: msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content,
                  icon: msg.senderId.image || undefined,
                  tag: `message-${msg._id}`,
                });
              });
            }
          }
          
          // Update previous message IDs
          previousMessageIds = new Set(data.map((msg: Message) => msg._id));
          setMessages(data);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [params.id, session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // 同時取得訊息和對話資訊
      const [messagesResponse, conversationsResponse] = await Promise.all([
        fetch(`/api/conversations/${params.id}/messages`),
        fetch('/api/conversations')
      ]);

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      }

      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        const currentConv = conversationsData.find(
          (c: Conversation) => c._id === params.id
        );
        if (currentConv) {
          setConversation(currentConv);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageContent('');
        // Refresh conversations list
        fetch('/api/conversations').then(() => {
          // Update last message in conversation
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation || !session) return null;
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

  const otherUser = getOtherParticipant();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 flex flex-col transition-colors" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center space-x-4">
          <button
            onClick={() => router.push('/chat')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mr-4 transition-colors"
          >
            ← 返回
          </button>
          {otherUser?.image ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
              <Image
                src={otherUser.image}
                alt={otherUser.name}
                width={40}
                height={40}
                className="rounded-full"
                onError={(e) => {
                  // 如果圖片載入失敗，隱藏圖片並顯示預設頭像
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300">
                {otherUser?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {otherUser?.name || '未知用戶'}
            </h2>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              尚無訊息，開始對話吧！
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.senderId._id === session?.user?.id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMe
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {message.senderId.name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center space-x-4"
        >
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageContent.trim() || sending}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '發送中...' : '發送'}
          </button>
        </form>
      </div>
    </div>
  );
}

