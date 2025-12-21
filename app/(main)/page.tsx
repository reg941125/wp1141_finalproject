'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Combobox from '@/components/Combobox';
import { HiEye } from 'react-icons/hi';
import { IoMdThumbsUp } from 'react-icons/io';
import { BiSolidMessageCheck } from 'react-icons/bi';
import { RiQuestionnaireFill } from "react-icons/ri";

const LEVEL_OPTIONS = ['國小', '國中', '高中', '大學', '研究所'];
const SUBJECT_OPTIONS_BY_LEVEL: Record<string, string[]> = {
  '國小': ['國語', '英文', '數學', '自然', '社會'],
  '國中': ['國文', '英文', '數學', '生物', '理化', '地科', '歷史', '地理', '公民'],
  '高中': ['國文', '英文', '數學', '物理', '化學', '生物', '地科', '歷史', '地理', '公民'],
  '大學': [],
  '研究所': [],
  '其他': [],
};
const ALL_SUBJECT_OPTIONS = Array.from(
  new Set(Object.values(SUBJECT_OPTIONS_BY_LEVEL).flat().filter(Boolean))
);

interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  level?: string;
  subject?: string;
  answersCount?: number;
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
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [levelOptions, setLevelOptions] = useState<string[]>(LEVEL_OPTIONS);
  const [subjectOptionsState, setSubjectOptionsState] = useState<string[]>(ALL_SUBJECT_OPTIONS);

  useEffect(() => {
    if (
      selectedLevel &&
      selectedSubject &&
      !SUBJECT_OPTIONS_BY_LEVEL[selectedLevel]?.includes(selectedSubject)
    ) {
      setSelectedSubject('');
    }
  }, [selectedLevel, selectedSubject]);

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTag) params.append('tag', selectedTag);
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedSubject) params.append('subject', selectedSubject);
      const queryString = params.toString();
      const url = queryString ? `/api/posts?${queryString}` : '/api/posts';
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data);
      // 收集現有的程度/科目，補充到下拉清單
      const levelSet = new Set(LEVEL_OPTIONS);
      const subjectSet = new Set(ALL_SUBJECT_OPTIONS);
      data.forEach((post: Post) => {
        if (post.level && post.level.trim()) {
          levelSet.add(post.level.trim());
        }
        if (post.subject && post.subject.trim()) {
          subjectSet.add(post.subject.trim());
        }
      });
      setLevelOptions(Array.from(levelSet));
      setSubjectOptionsState(Array.from(subjectSet));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTag, selectedLevel, selectedSubject]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const subjectOptions = useMemo(() => {
    if (selectedLevel && SUBJECT_OPTIONS_BY_LEVEL[selectedLevel]?.length) {
      const levelSubjects = SUBJECT_OPTIONS_BY_LEVEL[selectedLevel];
      const extras = posts
        .filter((post) => post.level === selectedLevel && post.subject && post.subject.trim())
        .map((post) => post.subject!.trim())
        .filter((subject) => !levelSubjects.includes(subject));
      return Array.from(new Set([...levelSubjects, ...extras]));
    }
    return subjectOptionsState;
  }, [selectedLevel, posts, subjectOptionsState]);

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
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center gap-2 hover:scale-105 duration-300"
          >
            <RiQuestionnaireFill className="scale-125" />
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
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-[-2px] focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
        />
        <div className="flex flex-row gap-4">
          <div className="w-full lg:w-48">
            <Combobox
              value={selectedLevel}
              onChange={setSelectedLevel}
              options={levelOptions}
              placeholder="篩選程度"
            />
          </div>
          <div className="w-full lg:w-48">
            <Combobox
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={subjectOptions}
              placeholder="篩選科目"
            />
          </div>
          {(selectedLevel || selectedSubject) && (
            <button
              type="button"
              onClick={() => {
                setSelectedLevel('');
                setSelectedSubject('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              清除篩選
            </button>
          )}
        </div>
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
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                <span>{post.authorId?.name || '匿名'}</span>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
              </div>
              {(() => {
                const level = post.level || '';
                const subject = post.subject || '';
                const tags = post.tags || [];
                const hasLevel = Boolean(level && level.trim());
                const hasSubject = Boolean(subject && subject.trim());
                const hasTagList = tags.length > 0;

                return (
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {hasLevel && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        level === '國小' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        level === '國中' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        level === '高中' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                        level === '大學' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                        level === '研究所' ? 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {level}
                      </span>
                    )}
                    {hasSubject && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs">
                        {subject}
                      </span>
                    )}
                    {hasTagList && tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    <div className="ml-auto flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <HiEye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IoMdThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BiSolidMessageCheck className="w-4 h-4" />
                        <span>{post.answersCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


