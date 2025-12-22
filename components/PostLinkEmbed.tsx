'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiEye } from 'react-icons/hi';
import { IoMdThumbsUp } from 'react-icons/io';
import { BiSolidMessageCheck } from 'react-icons/bi';

interface EmbeddedPost {
  _id: string;
  title: string;
  content: string;
  level?: string;
  tags: string[];
  authorId: {
    _id: string;
    name: string;
    image?: string;
  };
  views: number;
  likes: number;
  answersCount?: number;
  createdAt: string;
}

interface PostLinkEmbedProps {
  postId: string;
}

export default function PostLinkEmbed({ postId }: PostLinkEmbedProps) {
  const [post, setPost] = useState<EmbeddedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching embedded post:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="my-4 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">載入貼文預覽...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="my-4 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">無法載入貼文預覽</div>
      </div>
    );
  }

  return (
    <Link
      href={`/questions/${post._id}`}
      className="block my-4 border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
          📌 引用的貼文
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {post.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {post.content.substring(0, 150)}...
      </p>

      <div className="flex items-center gap-3 mb-2">
        {post.authorId?.image ? (
          <Image
            src={post.authorId.image}
            alt={post.authorId.name}
            width={24}
            height={24}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-gray-700 dark:text-gray-300 text-xs font-bold">
              {post.authorId?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        )}
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {post.authorId?.name || '匿名'}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(post.createdAt).toLocaleDateString('zh-TW')}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {post.level && (
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
            {post.level}
          </span>
        )}
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
          >
            {tag}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <HiEye className="w-3 h-3" />
            <span>{post.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <IoMdThumbsUp className="w-3 h-3" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <BiSolidMessageCheck className="w-3 h-3" />
            <span>{post.answersCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

