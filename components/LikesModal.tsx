import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  image?: string;
  customImage?: string;
  username?: string;
}

interface LikesModalProps {
  users: User[];
  onClose: () => void;
  title?: string;
}

export default function LikesModal({ users, onClose, title = '按讚的人' }: LikesModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              尚無用戶
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <Link
                  key={user._id}
                  href={`/profile/${user._id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  {(user.customImage || user.image) && (
                    <Image
                      src={(user.customImage || user.image) as string}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    {user.username && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

