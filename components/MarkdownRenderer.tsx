'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { parseLaTeX } from './LaTeXParser';
import Image from 'next/image';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Pre-process LaTeX syntax
  const processedContent = parseLaTeX(content);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={{
          img: ({ node, ...props }) => (
            <Image
              {...props}
              alt={props.alt || ''}
              width={800}
              height={600}
              className="rounded-lg"
            />
          ),
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
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
          ul: ({ node, ...props }) => <ul className="mb-2 list-disc pl-6" {...props} />,
          ol: ({ node, ...props }) => <ol className="mb-2 list-decimal pl-6" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code: ({ node, inline, ...props }: any) => {
            if (inline) {
              return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm text-gray-900 dark:text-gray-100" {...props} />;
            }
            return <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto text-gray-900 dark:text-gray-100" {...props} />;
          },
          pre: ({ node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-2" {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
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

