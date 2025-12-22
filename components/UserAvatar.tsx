import Image from 'next/image';
import Link from 'next/link';

interface UserAvatarProps {
  userId: string;
  name: string;
  image?: string;
  customImage?: string;
  size?: number;
  showName?: boolean;
  clickable?: boolean;
  className?: string;
}

export default function UserAvatar({
  userId,
  name,
  image,
  customImage,
  size = 32,
  showName = true,
  clickable = true,
  className = '',
}: UserAvatarProps) {
  const avatarSrc = customImage || image;
  
  const AvatarContent = () => (
    <>
      {avatarSrc && (
        <Image
          src={avatarSrc}
          alt={name}
          width={size}
          height={size}
          className="rounded-full"
        />
      )}
      {showName && (
        <span className={`text-sm ${clickable ? 'hover:text-gray-900 dark:hover:text-white' : ''} transition-colors`}>
          {name}
        </span>
      )}
    </>
  );

  if (!clickable) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AvatarContent />
      </div>
    );
  }

  return (
    <Link
      href={`/profile/${userId}`}
      className={`flex items-center gap-2 hover:opacity-75 transition-opacity ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <AvatarContent />
    </Link>
  );
}

