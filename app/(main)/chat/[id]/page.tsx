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
  read: boolean;
  readAt?: string;
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
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const unreadDividerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [shouldScrollToUnread, setShouldScrollToUnread] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  useEffect(() => {
    // 如果未登入，立即清除所有數據並重定向
    if (status === 'unauthenticated') {
      setMessages([]);
      setConversation(null);
      setMessageContent('');
      setFirstUnreadMessageId(null);
      setShouldScrollToUnread(false);
      setShouldScrollToBottom(false);
      setLoading(false);
      router.push('/login');
      return;
    }
    
    // 只有在已登入時才載入數據
    if (status === 'authenticated' && session) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      fetchMessages(true);
      
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
    }
  }, [params.id, session, status, router]);

  const scrollToBottom = () => {
    // 滾動聊天室容器到底部，而不是整個頁面
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const scrollToUnread = () => {
    // 滾動到未讀分隔線
    if (unreadDividerRef.current && messagesContainerRef.current) {
      const dividerTop = unreadDividerRef.current.offsetTop;
      const containerHeight = messagesContainerRef.current.clientHeight;
      // 將未讀分隔線滾動到容器中間偏上的位置
      messagesContainerRef.current.scrollTop = dividerTop - containerHeight / 3;
    }
  };

  // 在訊息載入後滾動到未讀位置或底部
  useEffect(() => {
    if (shouldScrollToUnread && firstUnreadMessageId && messages.length > 0) {
      // 給 DOM 一點時間渲染
      setTimeout(() => {
        scrollToUnread();
        setShouldScrollToUnread(false);
      }, 100);
    } else if (shouldScrollToBottom && messages.length > 0) {
      // 沒有未讀訊息時，滾動到聊天室底部
      setTimeout(() => {
        scrollToBottom();
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [shouldScrollToUnread, shouldScrollToBottom, firstUnreadMessageId, messages]);

  const fetchMessages = async (isInitialLoad: boolean = false) => {
    try {
      // 同時取得訊息和對話資訊
      const [messagesResponse, conversationsResponse] = await Promise.all([
        fetch(`/api/conversations/${params.id}/messages`),
        fetch('/api/conversations')
      ]);

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        
        // 只在初次載入時記錄第一條未讀訊息的 ID
        if (isInitialLoad && !firstUnreadMessageId) {
          const firstUnread = messagesData.find(
            (msg: Message) => !msg.read && msg.senderId._id !== session?.user?.id
          );
          if (firstUnread) {
            // 有未讀訊息：滾動到未讀分隔線
            setFirstUnreadMessageId(firstUnread._id);
            setShouldScrollToUnread(true);
          } else {
            // 沒有未讀訊息：滾動到底部
            setShouldScrollToBottom(true);
          }
        }
        
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
        // 發送訊息後自動滾動聊天室到底部
        setTimeout(() => scrollToBottom(), 100);
        // 自動聚焦回輸入框
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
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

  // 在檢查 session 時不顯示任何內容
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-gray-900 dark:text-white">
          {status === 'loading' ? '載入中...' : '重定向中...'}
        </div>
      </div>
    );
  }

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
            messages.map((message, index) => {
              const isMe = message.senderId._id === session?.user?.id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              
              // 檢查是否需要顯示日期分隔線
              const messageDate = new Date(message.createdAt);
              const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;
              const showDateDivider = !prevMessageDate || 
                messageDate.toDateString() !== prevMessageDate.toDateString();
              
              // 檢查是否需要顯示未讀分隔線（使用初次載入時記錄的第一條未讀訊息）
              const isFirstUnread = firstUnreadMessageId && message._id === firstUnreadMessageId;
              
              return (
                <div key={message._id}>
                  {/* 日期分隔線 */}
                  {showDateDivider && (
                    <div className="flex items-center my-6">
                      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                      <div className="px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {messageDate.toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                    </div>
                  )}
                  
                  {/* 未讀分隔線 */}
                  {isFirstUnread && (
                    <div ref={unreadDividerRef} className="flex items-center my-4">
                      <div className="flex-1 h-px bg-red-500"></div>
                      <div className="px-3 py-1 text-xs font-bold text-red-500 uppercase">
                        新訊息
                      </div>
                      <div className="flex-1 h-px bg-red-500"></div>
                    </div>
                  )}
                  
                  {/* 訊息氣泡 */}
                  <div
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
                      <div className="flex items-center justify-end mt-1 space-x-2">
                        <p
                          className={`text-xs ${
                            isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {isMe && (
                          <span
                            className={`text-xs ${
                              isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
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
            ref={inputRef}
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

