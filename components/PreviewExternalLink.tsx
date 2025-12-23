'use client';

import { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';

interface PreviewExternalLinkProps {
  url: string;
  children?: ReactNode;
}

export default function PreviewExternalLink({ url, children }: PreviewExternalLinkProps) {
  // 在預覽模式下，只顯示簡化的連結文字
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink size={12} />
      {children || url}
    </a>
  );
}

