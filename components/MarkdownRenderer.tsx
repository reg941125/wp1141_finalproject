'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { parseLaTeX } from './LaTeXParser';
import Image from 'next/image';
import PostLinkEmbed from './PostLinkEmbed';
import ExternalLinkPreview from './ExternalLinkPreview';
import PreviewExternalLink from './PreviewExternalLink';
import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  preview?: boolean; // 预览模式：简化显示，不显示图片和嵌入内容
}

export default function MarkdownRenderer({ content, className = '', preview = false }: MarkdownRendererProps) {
  // Pre-process LaTeX syntax
  const processedContent = parseLaTeX(content);

  // 檢測站內貼文連結和外部連結並直接分割內容
  const contentParts = useMemo(() => {
    const parts: Array<{ type: 'text' | 'post-embed' | 'external-link'; content: string }> = [];
    
    // 匹配站內貼文連結的正則表達式
    const postLinkRegex = /https?:\/\/[^\/\s]+\/questions\/([a-f0-9]{24})/gi;
    
    // 匹配外部連結的正則表達式（獨立一行的連結）
    const externalLinkRegex = /^(https?:\/\/[^\s]+)$/gm;
    
    let content = processedContent;
    let allMatches: Array<{ index: number; length: number; type: 'post-embed' | 'external-link'; content: string }> = [];
    
    // 收集所有站內貼文連結
    let match;
    postLinkRegex.lastIndex = 0;
    while ((match = postLinkRegex.exec(content)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'post-embed',
        content: match[1] // postId
      });
    }
    
    // 收集所有外部連結（排除已經是站內連結的）
    externalLinkRegex.lastIndex = 0;
    while ((match = externalLinkRegex.exec(content)) !== null) {
      const url = match[1];
      // 檢查是否是站內連結
      if (!url.match(/\/questions\/[a-f0-9]{24}/)) {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          type: 'external-link',
          content: url
        });
      }
    }
    
    // 按位置排序
    allMatches.sort((a, b) => a.index - b.index);
    
    // 移除重疊的匹配（優先保留站內連結）
    const filteredMatches: Array<{ type: 'post-embed' | 'external-link'; index: number; length: number; content: string }> = [];
    for (let i = 0; i < allMatches.length; i++) {
      const current = allMatches[i];
      const hasOverlap = filteredMatches.some(prev => 
        current.index < prev.index + prev.length
      );
      if (!hasOverlap) {
        filteredMatches.push(current);
      }
    }
    
    // 構建 parts 數組
    let lastIndex = 0;
    for (const match of filteredMatches) {
      // 添加連結前的文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // 添加嵌入內容
      parts.push({
        type: match.type,
        content: match.content
      });
      
      lastIndex = match.index + match.length;
    }
    
    // 添加剩餘的文本
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // 如果沒有匹配，返回整個內容
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content
      });
    }
    
    return parts;
  }, [processedContent]);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {contentParts.map((part, index) => {
        if (part.type === 'post-embed') {
          // 预览模式：只显示文字
          if (preview) {
            return <span key={`post-embed-${index}`} className="text-gray-500 dark:text-gray-400 text-sm">[嵌入貼文]</span>;
          }
          return <PostLinkEmbed key={`post-embed-${index}`} postId={part.content} />;
        }
        
        if (part.type === 'external-link') {
          // 预览模式：使用 PreviewExternalLink 显示替代文字和 hover 预览
          if (preview) {
            return <PreviewExternalLink key={`external-link-${index}`} url={part.content} />;
          }
          return <ExternalLinkPreview key={`external-link-${index}`} url={part.content} />;
        }
        
        return (
          <ReactMarkdown
            key={`text-${index}`}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
            components={{
              img: ({ node, ...props }: any) => {
                // 预览模式：只显示 <图片> 文字
                if (preview) {
                  return <span className="text-gray-500 dark:text-gray-400 text-sm">&lt;圖片&gt;</span>;
                }
                
                if (!props.src) {
                  return <img {...props} alt={props.alt || ''} className="rounded-lg" />;
                }
                return (
                  <Image
                    src={props.src}
                    alt={props.alt || ''}
                    width={800}
                    height={600}
                    className="rounded-lg"
                    unoptimized
                  />
                );
              },
              p: ({ node, ...props }) => <p className="py-1 text-sm" {...props} />,
              h1: ({ node, ...props }) => (
                <h1 
                  className="mb-2 mt-4 font-bold text-gray-900 dark:text-gray-100" 
                  style={{ fontSize: '2em', lineHeight: '1.2', fontWeight: 700 }}
                  {...props} 
                />
              ),
              h2: ({ node, ...props }) => (
                <h2 
                  className="mb-2 mt-4 font-semibold text-gray-900 dark:text-gray-100" 
                  style={{ fontSize: '1.5em', lineHeight: '1.3', fontWeight: 600 }}
                  {...props} 
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 
                  className="mb-2 mt-3 font-semibold text-gray-900 dark:text-gray-100" 
                  style={{ fontSize: '1.25em', lineHeight: '1.4', fontWeight: 600 }}
                  {...props} 
                />
              ),
              ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-6 text-sm" {...props} />,
              ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-6 text-sm" {...props} />,
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              code: ({ node, inline, ...props }: any) => {
                if (inline) {
                  return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm text-gray-900 dark:text-gray-100" {...props} />;
                }
                return <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-100" {...props} />;
              },
              pre: ({ node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-2" {...props} />,
              a: ({ node, href, children, ...props }: any) => {
                // 检查是否是外部链接
                if (!href) return <a {...props}>{children}</a>;
                
                try {
                  const url = new URL(href);
                  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
                  
                  // 检查是否是站内链接
                  const isInternalPost = /\/questions\/([a-f0-9]{24})/.test(href);
                  const isInternal = url.origin === currentOrigin || isInternalPost;
                  
                  // 预览模式下，外部链接使用 PreviewExternalLink
                  if (preview && !isInternal) {
                    return <PreviewExternalLink url={href}>{children}</PreviewExternalLink>;
                  }
                  
                  // 非预览模式或内部链接，使用默认渲染
                  return (
                    <a
                      href={href}
                      target={isInternal ? undefined : '_blank'}
                      rel={isInternal ? undefined : 'noopener noreferrer'}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                } catch {
                  // URL 解析失败，使用默认渲染
                  return (
                    <a
                      href={href}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
              },
            }}
          >
            {part.content}
          </ReactMarkdown>
        );
      })}
      <style jsx global>{`
        .prose {
          color: inherit;
        }
        .prose p {
          margin-top: 0;
          margin-bottom: 0;
        }
        .prose a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .dark .prose a {
          color: #60a5fa;
        }
        .prose code {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .dark .prose code {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .prose pre {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .dark .prose pre {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .prose pre code {
          background-color: transparent;
          padding: 0;
        }
        .prose h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 0.5em;
          margin-bottom: 0.25em;
          line-height: 1.2;
        }
        .prose h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.25em;
          line-height: 1.3;
        }
        .prose h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.25em;
          line-height: 1.4;
        }
        .prose h4, .prose h5, .prose h6 {
          font-weight: 600;
          margin-top: 0.5em;
          margin-bottom: 0.25em;
        }
        .prose ul, .prose ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose blockquote {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}

