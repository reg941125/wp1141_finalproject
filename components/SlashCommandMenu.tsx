'use client';

import { useState, useEffect, useRef } from 'react';

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  filter?: string;
  onSelect: (command: { id: string; label: string; shortcut?: string }) => void;
  onClose: () => void;
}

const commands: Command[] = [
  {
    id: 'text',
    label: 'Text',
    icon: 'T',
    action: () => {},
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    icon: 'H1',
    shortcut: '#',
    action: () => {},
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    icon: 'H2',
    shortcut: '##',
    action: () => {},
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    icon: 'H3',
    shortcut: '###',
    action: () => {},
  },
  {
    id: 'bullet-list',
    label: 'Bulleted list',
    icon: '•',
    shortcut: '-',
    action: () => {},
  },
  {
    id: 'inline-equation',
    label: 'Inline equation',
    icon: '√x',
    shortcut: '/in',
    action: () => {},
  },
  {
    id: 'block-equation',
    label: 'Block equation',
    icon: 'TEX',
    shortcut: '/block',
    action: () => {},
  },
];

export default function SlashCommandMenu({
  position,
  filter = '',
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
    cmd.shortcut?.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect({
            id: filteredCommands[selectedIndex].id,
            label: filteredCommands[selectedIndex].label,
            shortcut: filteredCommands[selectedIndex].shortcut,
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '280px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      <div className="p-2 border-b border-gray-100">
        <div className="text-xs text-gray-500 font-medium">Basic blocks</div>
      </div>
      <div className="py-1">
        {filteredCommands.map((command, index) => (
          <div
            key={command.id}
            onClick={() => onSelect({
              id: command.id,
              label: command.label,
              shortcut: command.shortcut,
            })}
            className={`flex items-center px-3 py-2 cursor-pointer ${
              index === selectedIndex
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center text-gray-600 text-lg font-semibold mr-3">
              {command.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900">{command.label}</div>
            </div>
            {command.shortcut && (
              <div className="text-xs text-gray-400 font-mono">
                {command.shortcut}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Type '/' on the page</span>
        <span>esc</span>
      </div>
    </div>
  );
}

