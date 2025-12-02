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
        rehypePlugins={[rehypeKatex]}
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
          p: ({ node, ...props }) => <p className="mb-0" {...props} />,
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
        .prose code {
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .prose pre {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose pre code {
          background-color: transparent;
          padding: 0;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
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

