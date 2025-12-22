import { IoMdThumbsUp } from 'react-icons/io';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  isLiked: boolean;
  likes: number;
  onLike: (e: React.MouseEvent) => void;
  isLiking?: boolean;
  variant?: 'thumb' | 'heart';
  size?: number;
  className?: string;
}

export default function LikeButton({
  isLiked,
  likes,
  onLike,
  isLiking = false,
  variant = 'thumb',
  size = 20,
  className = '',
}: LikeButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLiking) {
      onLike(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLiking}
      className={`flex items-center gap-1 transition-colors ${
        isLiked
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
      } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {variant === 'thumb' ? (
        <IoMdThumbsUp size={size} className={isLiked ? 'fill-current' : ''} />
      ) : (
        <Heart size={size} className={isLiked ? 'fill-current' : ''} />
      )}
      <span className="text-sm">{likes}</span>
    </button>
  );
}

