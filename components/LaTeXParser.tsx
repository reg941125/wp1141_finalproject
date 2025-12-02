'use client';

import { useEffect, useRef } from 'react';

interface LaTeXParserProps {
  content: string;
  className?: string;
}

export function parseLaTeX(content: string): string {
  // Replace \in{...} with inline math
  let processed = content.replace(/\\in\{([^}]+)\}/g, (match, equation) => {
    return `$${equation}$`;
  });

  // Replace \block{...} with block math
  processed = processed.replace(/\\block\{([^}]+)\}/g, (match, equation) => {
    return `$$${equation}$$`;
  });

  return processed;
}

export default function LaTeXParser({ content, className = '' }: LaTeXParserProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Load MathJax if not already loaded
      if (!(window as any).MathJax) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          if ((window as any).MathJax && containerRef.current) {
            (window as any).MathJax.typesetPromise([containerRef.current]);
          }
        };
      } else if (containerRef.current) {
        (window as any).MathJax.typesetPromise([containerRef.current]);
      }
    }
  }, [content]);

  const processedContent = parseLaTeX(content);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

