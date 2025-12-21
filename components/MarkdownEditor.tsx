'use client';

import { useState, useRef, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import LaTeXInput from './LaTeXInput';
import SlashCommandMenu from './SlashCommandMenu';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
}

interface LaTeXInputState {
  show: boolean;
  type: 'inline' | 'block';
  position: { top: number; left: number };
  startPos: number;
}

interface SlashMenuState {
  show: boolean;
  position: { top: number; left: number };
  startPos: number;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '輸入內容...',
  className = '',
  showPreview = true,
}: MarkdownEditorProps) {
  const [latexInput, setLatexInput] = useState<LaTeXInputState>({
    show: false,
    type: 'inline',
    position: { top: 0, left: 0 },
    startPos: 0,
  });
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
    show: false,
    position: { top: 0, left: 0 },
    startPos: 0,
  });
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async (file: File) => {
    // This will be handled by the parent component or API route
    // For now, we'll just insert a placeholder
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const markdown = `![${file.name}](${imageUrl})\n`;
      const cursorPos = textareaRef.current?.selectionStart || 0;
      const newValue =
        value.slice(0, cursorPos) + markdown + value.slice(cursorPos);
      onChange(newValue);
    };
    reader.readAsDataURL(file);
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);

    // Handle slash menu navigation
    if (slashMenu.show) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        // Let SlashCommandMenu handle these
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSlashMenuClose();
        return;
      }
      if (e.key === 'Backspace' && cursorPos <= slashMenu.startPos + 1) {
        // If backspace would delete the /, close menu
        // Don't prevent default, let the backspace happen
        setTimeout(() => {
          if (textareaRef.current && textareaRef.current.selectionStart <= slashMenu.startPos) {
            handleSlashMenuClose();
          }
        }, 0);
      }
    }

    // Check for slash command - don't prevent default, let / be inserted
    if (e.key === '/' && !slashMenu.show && !latexInput.show) {
      // Check if / is at the start of line or after whitespace
      const charBefore = textBeforeCursor.slice(-1);
      if (cursorPos === 0 || charBefore === '\n' || charBefore === ' ') {
        // Don't prevent default - let / be inserted
        // Show menu after / is inserted
        setTimeout(() => {
          if (textareaRef.current) {
            const rect = textareaRef.current.getBoundingClientRect();
            const containerRect = containerRef.current?.getBoundingClientRect();
            
            const scrollTop = containerRef.current?.scrollTop || 0;
            const scrollLeft = containerRef.current?.scrollLeft || 0;
            
            // Calculate position based on cursor (after / is inserted)
            const newCursorPos = textareaRef.current.selectionStart;
            const textBeforeNewCursor = value.slice(0, newCursorPos - 1);
            const lineHeight = 20;
            const linesBeforeCursor = textBeforeNewCursor.split('\n').length - 1;
            
            setSlashMenu({
              show: true,
              position: {
                top: rect.top - (containerRect?.top || 0) + scrollTop + (linesBeforeCursor * lineHeight) + 5,
                left: rect.left - (containerRect?.left || 0) + scrollLeft,
              },
              startPos: newCursorPos - 1, // Position of the /
            });
          }
        }, 0);
      }
    }

    // Check if space key is pressed for LaTeX
    if (e.key === ' ' && !latexInput.show && !slashMenu.show) {
      const lastChars = textBeforeCursor.slice(-7);

      if (lastChars.endsWith('/in ')) {
        e.preventDefault();
        showLaTeXInput('inline', cursorPos - 4, textarea);
      } else if (lastChars.endsWith('/block ')) {
        e.preventDefault();
        showLaTeXInput('block', cursorPos - 7, textarea);
      }
    }

  };

  const showLaTeXInput = (type: 'inline' | 'block', startPos: number, textarea: HTMLTextAreaElement) => {
    const rect = textarea.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    const scrollLeft = containerRef.current?.scrollLeft || 0;
    
    setLatexInput({
      show: true,
      type,
      position: {
        top: rect.bottom - (containerRect?.top || 0) + scrollTop + 5,
        left: rect.left - (containerRect?.left || 0) + scrollLeft,
      },
      startPos,
    });
  };

  const handleSlashCommand = (command: { id: string; label: string; shortcut?: string }) => {
    if (!textareaRef.current) return;

    const startPos = slashMenu.startPos;
    const currentCursorPos = textareaRef.current.selectionStart;
    let insertText = '';

    switch (command.id) {
      case 'text':
        // Keep the /, just close menu
        setSlashMenu({ ...slashMenu, show: false });
        return;
      case 'heading1':
        insertText = '# ';
        break;
      case 'heading2':
        insertText = '## ';
        break;
      case 'heading3':
        insertText = '### ';
        break;
      case 'bullet-list':
        insertText = '- ';
        break;
      case 'inline-equation':
        insertText = '/in ';
        break;
      case 'block-equation':
        insertText = '/block ';
        break;
      default:
        insertText = '';
    }

    // Replace from / to current cursor position with the command text
    const before = value.slice(0, startPos);
    const after = value.slice(currentCursorPos);
    const newValue = before + insertText + after;

    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = startPos + insertText.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();

        // If it's an equation command, show LaTeX input
        if (command.id === 'inline-equation' || command.id === 'block-equation') {
          setTimeout(() => {
            if (textareaRef.current) {
              showLaTeXInput(
                command.id === 'inline-equation' ? 'inline' : 'block',
                newPos - (command.id === 'inline-equation' ? 4 : 7),
                textareaRef.current
              );
            }
          }, 100);
        }
      }
    }, 0);

    setSlashMenu({ ...slashMenu, show: false });
  };

  const handleSlashMenuClose = () => {
    // Just close the menu, don't remove the /
    setSlashMenu({ ...slashMenu, show: false });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    // Update slash menu filter if menu is showing
    if (slashMenu.show) {
      const textAfterSlash = newValue.slice(slashMenu.startPos + 1, cursorPos); // +1 to skip the /
      // If user deleted the slash or moved cursor before it, close menu
      if (cursorPos <= slashMenu.startPos || newValue[slashMenu.startPos] !== '/') {
        setSlashMenu({ ...slashMenu, show: false });
      }
      // Otherwise, update filter with text after /
    }

    onChange(newValue);
  };

  const handleLaTeXConfirm = (latexValue: string) => {
    if (!textareaRef.current) return;

    const prefix = latexInput.type === 'inline' ? '/in ' : '/block ';
    const newText = `/${latexInput.type === 'inline' ? 'in' : 'block'}{${latexValue}}`;
    
    // Replace the /in  or /block  with the complete syntax
    const before = value.slice(0, latexInput.startPos);
    const after = value.slice(latexInput.startPos + prefix.length);
    const newValue = before + newText + after;

    onChange(newValue);

    // Set cursor position after the inserted LaTeX
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = latexInput.startPos + newText.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);

    setLatexInput({ ...latexInput, show: false });
  };

  const handleLaTeXCancel = () => {
    if (!textareaRef.current) return;

    // Remove the /in  or /block  that was typed (including the space)
    const prefix = latexInput.type === 'inline' ? '/in ' : '/block ';
    const before = value.slice(0, latexInput.startPos);
    const after = value.slice(latexInput.startPos + prefix.length);
    const newValue = before + after;

    onChange(newValue);

    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(latexInput.startPos, latexInput.startPos);
        textareaRef.current.focus();
      }
    }, 0);

    setLatexInput({ ...latexInput, show: false });
  };

  // Close LaTeX input when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (latexInput.show && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleLaTeXCancel();
      }
    };

    if (latexInput.show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [latexInput.show]);

  return (
    <div ref={containerRef} className={`border border-gray-300 dark:border-gray-600 rounded-lg ${className} transition-colors bg-white dark:bg-gray-800 overflow-hidden`}>
      {/* 手機版切換按鈕 */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          type="button"
          onClick={() => setMobileView('edit')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            mobileView === 'edit'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          編輯
        </button>
        {showPreview && (
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              mobileView === 'preview'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            預覽
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 min-h-[400px] md:min-h-[600px] md:items-stretch">
        {/* 編輯區域 */}
        <div className={`${mobileView === 'preview' ? 'hidden' : 'block'} md:block md:flex md:flex-col border-r-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-6 md:pb-6 py-4 md:py-0`}>
          <div className="hidden md:flex md:items-center md:justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-6 pt-6 flex-shrink-0">
            <span>編輯</span>
          </div>
          <div className="relative px-4 md:px-6 md:flex-1 md:flex md:flex-col md:min-h-0 md:overflow-hidden">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full p-4 min-h-[400px] md:flex-1 md:min-h-0 resize-none border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all shadow-sm overflow-auto focus:outline focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-[-2px] focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                wordWrap: 'break-word',
              }}
            />

            {/* Slash Command Menu */}
            {slashMenu.show && (
              <SlashCommandMenu
                position={slashMenu.position}
                filter={value.slice(slashMenu.startPos + 1, textareaRef.current?.selectionStart || slashMenu.startPos + 1)}
                onSelect={handleSlashCommand}
                onClose={handleSlashMenuClose}
              />
            )}

            {/* LaTeX Input */}
            {latexInput.show && (
              <LaTeXInput
                type={latexInput.type}
                onConfirm={handleLaTeXConfirm}
                onCancel={handleLaTeXCancel}
                position={latexInput.position}
              />
            )}
          </div>
        </div>

        {/* 預覽區域 */}
        {showPreview && (
          <div className={`${mobileView === 'edit' ? 'hidden' : 'block'} md:block md:flex md:flex-col pl-0 md:pl-6 md:pb-6 py-4 md:py-0`}>
            <div className="hidden md:flex md:items-center md:justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-6 pt-6 flex-shrink-0">
              <span>預覽</span>
            </div>
            <div
              ref={previewRef}
              className="p-4 min-h-[400px] md:flex-1 md:min-h-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto bg-white dark:bg-gray-800 transition-colors mx-4 md:mx-6 shadow-sm"
            >
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

