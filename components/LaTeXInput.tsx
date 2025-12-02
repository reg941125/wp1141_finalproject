'use client';

import { useState, useEffect, useRef } from 'react';

interface LaTeXInputProps {
  type: 'inline' | 'block';
  initialValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  position: { top: number; left: number };
}

export default function LaTeXInput({
  type,
  initialValue = '',
  onConfirm,
  onCancel,
  position,
}: LaTeXInputProps) {
  const [latex, setLatex] = useState(initialValue);
  const [preview, setPreview] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'inline' && inputRef.current) {
      inputRef.current.focus();
    } else if (type === 'block' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [type]);

  useEffect(() => {
    // Load MathJax if needed
    if (typeof window !== 'undefined') {
      if (!(window as any).MathJax) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.id = 'mathjax-script';
        if (!document.getElementById('mathjax-script')) {
          document.head.appendChild(script);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (latex.trim() && previewRef.current) {
      const mathString = type === 'inline' ? `$${latex}$` : `$$${latex}$$`;
      setPreview(mathString);
      
      // Render with MathJax
      const renderMath = () => {
        if ((window as any).MathJax && previewRef.current) {
          previewRef.current.innerHTML = mathString;
          (window as any).MathJax.typesetPromise([previewRef.current]).catch(() => {
            // If MathJax fails, show raw LaTeX
            if (previewRef.current) {
              previewRef.current.textContent = latex;
            }
          });
        } else {
          // Fallback: show raw LaTeX
          if (previewRef.current) {
            previewRef.current.textContent = latex;
          }
        }
      };

      // Wait for MathJax to load if needed
      if ((window as any).MathJax) {
        renderMath();
      } else {
        const checkMathJax = setInterval(() => {
          if ((window as any).MathJax) {
            clearInterval(checkMathJax);
            renderMath();
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkMathJax), 2000);
      }
    } else {
      setPreview('');
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
      }
    }
  }, [latex, type]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (latex.trim()) {
      onConfirm(latex.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: type === 'block' ? '500px' : '400px',
      }}
    >
      {type === 'inline' ? (
        // Inline equation style
        <>
          <div className="p-2 border-b border-gray-100">
            <button className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded hover:bg-gray-100">
              √x New equation
            </button>
          </div>
          <div className="p-3">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E = mc^2"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center font-medium"
              >
                Done
                <span className="ml-1 text-lg">↵</span>
              </button>
            </div>
            {preview && (
              <div
                ref={previewRef}
                className="mt-2 p-2 bg-white border border-gray-200 rounded-lg min-h-[40px] flex items-center justify-center"
                style={{ overflowX: 'auto' }}
              />
            )}
          </div>
        </>
      ) : (
        // Block equation style (TeX)
        <>
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 font-mono">T<sub>E</sub>X</span>
              <input
                ref={inputRef}
                type="text"
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a TeX equation"
                className="flex-1 px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="p-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]">
              <textarea
                ref={textareaRef}
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="輸入 LaTeX 公式..."
                className="w-full bg-transparent border-0 focus:outline-none resize-none font-mono text-sm"
                rows={4}
              />
            </div>
            {preview && (
              <div
                ref={previewRef}
                className="mt-3 p-3 bg-white border border-gray-200 rounded-lg min-h-[60px] flex items-center justify-center"
                style={{ overflowX: 'auto' }}
              />
            )}
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center font-medium"
              >
                Done
                <span className="ml-1 text-lg">↵</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

