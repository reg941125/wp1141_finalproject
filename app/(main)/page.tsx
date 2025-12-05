'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: {
    name: string;
  };
  createdAt: string;
  views: number;
  likes: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const url = selectedTag
        ? `/api/posts?tag=${selectedTag}`
        : '/api/posts';
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">題目討論區</h1>
        {session && (
          <Link
            href="/questions/new"
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            發問
          </Link>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="搜尋題目..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedTag === ''
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-700 dark:text-gray-300">載入中...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          尚無題目，成為第一個發問的人吧！
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post._id}
              href={`/questions/${post._id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {post.title}
              </h2>
              <div className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                <MarkdownRenderer content={post.content.substring(0, 200)} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>{post.authorId?.name || '匿名'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span>👁️ {post.views}</span>
                    <span>👍 {post.likes}</span>
                  </div>
                  <div className="flex space-x-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


