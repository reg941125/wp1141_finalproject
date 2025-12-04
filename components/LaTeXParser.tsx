'use client';

import { useEffect, useRef } from 'react';

interface LaTeXParserProps {
  content: string;
  className?: string;
}

export function parseLaTeX(content: string): string {
  // Helper function to find matching closing brace
  const findMatchingBrace = (str: string, startPos: number): number => {
    let depth = 1; // We start inside one brace
    for (let i = startPos; i < str.length; i++) {
      if (str[i] === '{') depth++;
      if (str[i] === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  };

  let result = '';
  let i = 0;

  // Process both /block{...} and /in{...} in one pass
  while (i < content.length) {
    const blockMatch = content.indexOf('/block{', i);
    const inlineMatch = content.indexOf('/in{', i);
    
    // Find the earliest match
    let nextMatch = -1;
    let matchType: 'block' | 'inline' | null = null;
    
    if (blockMatch !== -1 && inlineMatch !== -1) {
      if (blockMatch < inlineMatch) {
        nextMatch = blockMatch;
        matchType = 'block';
      } else {
        nextMatch = inlineMatch;
        matchType = 'inline';
      }
    } else if (blockMatch !== -1) {
      nextMatch = blockMatch;
      matchType = 'block';
    } else if (inlineMatch !== -1) {
      nextMatch = inlineMatch;
      matchType = 'inline';
    }
    
    if (nextMatch === -1) {
      // No more matches, add rest of content
      result += content.slice(i);
      break;
    }
    
    // Add content before match
    result += content.slice(i, nextMatch);
    
    // Process the match
    const prefixLength = matchType === 'block' ? 7 : 4; // '/block{' or '/in{'
    const braceStart = nextMatch + prefixLength;
    const braceEnd = findMatchingBrace(content, braceStart);
    
    if (braceEnd !== -1) {
      const equation = content.slice(braceStart, braceEnd);
      if (matchType === 'block') {
        result += `\n\n$$\n${equation}\n$$\n\n`;
      } else {
        result += `$${equation}$`;
      }
      i = braceEnd + 1;
    } else {
      // No matching brace, keep original and continue
      result += content.slice(nextMatch, nextMatch + prefixLength);
      i = nextMatch + prefixLength;
    }
  }

  return result;
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


