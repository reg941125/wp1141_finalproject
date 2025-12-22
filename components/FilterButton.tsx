interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple';
}

export default function FilterButton({
  label,
  isSelected,
  onClick,
  color = 'blue',
}: FilterButtonProps) {
  const colorClasses = {
    blue: isSelected
      ? 'bg-blue-600 dark:bg-blue-700 text-white'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
    green: isSelected
      ? 'bg-green-600 dark:bg-green-700 text-white'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
    purple: isSelected
      ? 'bg-purple-600 dark:bg-purple-700 text-white'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition-colors ${colorClasses[color]}`}
    >
      {label}
    </button>
  );
}

