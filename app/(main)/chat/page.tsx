'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    image?: string;
    customImage?: string;
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

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);

  const fetchSingleConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data);
      }
    } catch (error) {
      console.error('Error fetching single conversation:', error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        
        // If we have a conversationId, set the selected conversation
        if (conversationId) {
          const conv = data.find((c: Conversation) => c._id === conversationId);
          if (conv) {
            setSelectedConversation(conv);
          } else {
            // 如果在列表中找不到（可能是新創建的還沒有消息），直接獲取該對話
            fetchSingleConversation(conversationId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, fetchSingleConversation]);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations/unread');
      if (response.ok) {
        const data = await response.json();
        setUnreadMap(data.byConversation || {});
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }, []);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Find first unread message
        const firstUnread = data.find(
          (msg: Message) => !msg.read && msg.senderId._id !== session?.user?.id
        );
        if (firstUnread) {
          setFirstUnreadMessageId(firstUnread._id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [session?.user?.id]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    router.push(`/chat?id=${conversation._id}`, { scroll: false });
    fetchMessages(conversation._id);
  }, [router, fetchMessages]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && session) {
      fetchConversations();
      fetchUnreadCounts();
      
      const interval = setInterval(() => {
        fetchConversations();
        fetchUnreadCounts();
        if (conversationId) {
          fetchMessages(conversationId);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [session, status, router, conversationId, fetchConversations, fetchUnreadCounts, fetchMessages]);

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        fetchMessages(conversationId);
      }
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [conversationId, conversations, fetchMessages]);

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      setTimeout(() => {
        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || sending || !conversationId) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage]);
        setMessageContent('');
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!session) return null;
    return conversation.participants.find(
      (p) => p._id !== session.user?.id
    );
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">
          {status === 'loading' ? '載入中...' : '重定向中...'}
        </div>
      </div>
    );
  }

  const otherUser = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Left Sidebar - Conversation List */}
      <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 ${conversationId ? 'hidden md:flex' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="返回首頁"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">訊息</h1>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">載入中...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              尚無對話記錄
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              if (!otherUser) return null;

              const isSelected = conversation._id === conversationId;
              const isLastMessageByMe = conversation.lastMessageBy?._id === session?.user?.id;
              const unreadCount = unreadMap[conversation._id] || 0;

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/profile/${otherUser._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      {(otherUser.customImage || otherUser.image) ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                          <Image
                            src={otherUser.customImage || otherUser.image}
                            alt={otherUser.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          href={`/profile/${otherUser._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-sm font-medium truncate hover:underline ${
                            unreadCount > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {otherUser.name}
                        </Link>
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {new Date(conversation.lastMessageAt).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate flex-1 min-w-0 ${
                            unreadCount > 0 
                              ? 'text-gray-900 dark:text-white font-medium' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {isLastMessageByMe && <span className="text-gray-500 dark:text-gray-400">你: </span>}
                            <span className="truncate">{conversation.lastMessage}</span>
                          </p>
                          {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${!conversationId ? 'hidden md:flex' : ''}`}>
        {selectedConversation && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center space-x-3">
              <button
                onClick={() => router.push('/chat', { scroll: false })}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors md:hidden"
                title="返回對話列表"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Link
                href={`/profile/${otherUser._id}`}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                {(otherUser.customImage || otherUser.image) ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                    <Image
                      src={otherUser.customImage || otherUser.image}
                      alt={otherUser.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
              <Link
                href={`/profile/${otherUser._id}`}
                className="hover:underline"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {otherUser.name}
                </h2>
              </Link>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  尚無訊息，開始對話吧！
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMe = message.senderId._id === session?.user?.id;
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  
                  const messageDate = new Date(message.createdAt);
                  const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;
                  const showDateDivider = !prevMessageDate || 
                    messageDate.toDateString() !== prevMessageDate.toDateString();
                  
                  const isFirstUnread = firstUnreadMessageId && message._id === firstUnreadMessageId;
                  
                  return (
                    <div key={message._id}>
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
                      
                      {isFirstUnread && (
                        <div className="flex items-center my-4">
                          <div className="flex-1 h-px bg-red-500"></div>
                          <div className="px-3 py-1 text-xs font-bold text-red-500 uppercase">
                            新訊息
                          </div>
                          <div className="flex-1 h-px bg-red-500"></div>
                        </div>
                      )}
                      
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className="flex items-center justify-end mt-1 space-x-2">
                            <p className={`text-xs ${
                              isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {isMe && (
                              <span className={`text-xs ${
                                isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
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
              className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
            >
              <div className="flex items-center space-x-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="輸入訊息..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!messageContent.trim() || sending}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {sending ? '發送中...' : '發送'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                選擇一個對話開始聊天
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
