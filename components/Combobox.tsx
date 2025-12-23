'use client';

import { useState, useRef, useEffect } from 'react';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = '選擇...',
  className = '',
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && filteredOptions.length > 0 && isOpen) {
      e.preventDefault();
      handleSelectOption(filteredOptions[0]);
    } else if (e.key === 'Enter' && filteredOptions.length === 0) {
      // Allow Enter to submit form even if no options match
      setIsOpen(false);
    }
  };

  // 如果 className 中沒有圓角類，補上預設的 rounded-md
  const hasRoundedClass = className && /rounded/.test(className);
  const baseClasses =
    'w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 focus:outline focus:outline-2 focus:outline-blue-500 dark:focus:outline-blue-400 focus:outline-offset-[-2px] focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors';
  const inputClassName = hasRoundedClass
    ? `${baseClasses} ${className}`
    : `${baseClasses} rounded-md ${className}`;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={
            filteredOptions.length > 0
              ? 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none'
              : 'hidden'
          }
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectOption(option)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors first:rounded-t-md last:rounded-b-md"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

