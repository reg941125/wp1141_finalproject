import FilterButton from './FilterButton';

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  color?: 'blue' | 'green' | 'purple';
  allLabel?: string;
}

export default function FilterSection({
  title,
  options,
  selected,
  onSelect,
  color = 'blue',
  allLabel = '全部',
}: FilterSectionProps) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterButton
          label={allLabel}
          isSelected={selected === ''}
          onClick={() => onSelect('')}
          color={color}
        />
        {options.map((option) => (
          <FilterButton
            key={option}
            label={option}
            isSelected={selected === option}
            onClick={() => onSelect(option)}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}

