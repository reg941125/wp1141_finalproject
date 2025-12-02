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

  // Sync scroll between textarea and preview
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current) {
      previewRef.current.scrollTop = e.currentTarget.scrollTop;
    }
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
      if (e.key === 'Backspace' && cursorPos === slashMenu.startPos) {
        e.preventDefault();
        handleSlashMenuClose();
        return;
      }
    }

    // Check for slash command
    if (e.key === '/' && !slashMenu.show && !latexInput.show) {
      // Check if / is at the start of line or after whitespace
      const charBefore = textBeforeCursor.slice(-1);
      if (cursorPos === 0 || charBefore === '\n' || charBefore === ' ') {
        e.preventDefault();
        const rect = textarea.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        const scrollTop = containerRef.current?.scrollTop || 0;
        const scrollLeft = containerRef.current?.scrollLeft || 0;
        
        // Calculate position based on cursor
        const lineHeight = 20;
        const linesBeforeCursor = textBeforeCursor.split('\n').length - 1;
        
        setSlashMenu({
          show: true,
          position: {
            top: rect.top - (containerRect?.top || 0) + scrollTop + (linesBeforeCursor * lineHeight) + 5,
            left: rect.left - (containerRect?.left || 0) + scrollLeft,
          },
          startPos: cursorPos,
        });
        return;
      }
    }

    // Check if space key is pressed for LaTeX
    if (e.key === ' ' && !latexInput.show && !slashMenu.show) {
      const lastChars = textBeforeCursor.slice(-7);

      if (lastChars.endsWith('\\in ')) {
        e.preventDefault();
        showLaTeXInput('inline', cursorPos - 4, textarea);
      } else if (lastChars.endsWith('\\block ')) {
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
    let insertText = '';

    switch (command.id) {
      case 'text':
        insertText = '';
        break;
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
        insertText = '\\in ';
        break;
      case 'block-equation':
        insertText = '\\block ';
        break;
      default:
        insertText = '';
    }

    const before = value.slice(0, startPos - 1); // Remove the /
    const after = value.slice(startPos);
    const newValue = before + insertText + after;

    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = startPos - 1 + insertText.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();

        // If it's an equation command, show LaTeX input
        if (command.id === 'inline-equation' || command.id === 'block-equation') {
          setTimeout(() => {
            if (textareaRef.current) {
              showLaTeXInput(
                command.id === 'inline-equation' ? 'inline' : 'block',
                newPos - (command.id === 'inline-equation' ? 4 : 6),
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
    if (!textareaRef.current) return;

    const before = value.slice(0, slashMenu.startPos - 1);
    const after = value.slice(slashMenu.startPos);
    const newValue = before + after;

    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(slashMenu.startPos - 1, slashMenu.startPos - 1);
        textareaRef.current.focus();
      }
    }, 0);

    setSlashMenu({ ...slashMenu, show: false });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    // Update slash menu filter if menu is showing
    if (slashMenu.show) {
      const textAfterSlash = newValue.slice(slashMenu.startPos, cursorPos);
      // If user deleted the slash or moved cursor, close menu
      if (textAfterSlash === '' || !textAfterSlash.startsWith('/')) {
        setSlashMenu({ ...slashMenu, show: false });
      }
    }

    onChange(newValue);
  };

  const handleLaTeXConfirm = (latexValue: string) => {
    if (!textareaRef.current) return;

    const prefix = latexInput.type === 'inline' ? '\\in ' : '\\block ';
    const newText = `\\${latexInput.type === 'inline' ? 'in' : 'block'}{${latexValue}}`;
    
    // Replace the \in  or \block  with the complete syntax
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

    // Remove the \in  or \block  that was typed (including the space)
    const prefix = latexInput.type === 'inline' ? '\\in ' : '\\block ';
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
    <div ref={containerRef} className={`border rounded-lg relative ${className}`}>
      <div className="relative min-h-[200px] overflow-hidden">
        {/* Preview Layer (Background) */}
        <div
          ref={previewRef}
          className="absolute inset-0 p-4 overflow-auto pointer-events-none"
        >
          <div 
            className="prose prose-sm max-w-none text-gray-900"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <MarkdownRenderer content={value || ''} />
          </div>
        </div>

        {/* Textarea Layer (Foreground) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={placeholder}
          className="relative w-full p-4 min-h-[200px] resize-none focus:outline-none bg-transparent text-transparent caret-blue-600 z-10"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '0.875rem',
            lineHeight: '1.7142857',
          }}
        />

        {/* Placeholder overlay when empty */}
        {!value && (
          <div className="absolute inset-0 p-4 pointer-events-none text-gray-400 z-0">
            {placeholder}
          </div>
        )}

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

        {/* Hint */}
        {value && !slashMenu.show && !latexInput.show && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none z-20">
            輸入 / 來開啟命令選單
          </div>
        )}
      </div>
    </div>
  );
}

