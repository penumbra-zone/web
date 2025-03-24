import cn from 'clsx';
import { Text } from '../Text';

export const ELLIPSIS_KEY = '...';

interface PaginationButtonProps {
  value: number | typeof ELLIPSIS_KEY;
  onClick: VoidFunction;
  active?: boolean;
}

export const PaginationButton = ({ value, onClick, active }: PaginationButtonProps) => {
  const disabled = value === ELLIPSIS_KEY;

  let color = active
    ? cn('text-text-primary bg-other-tonalFill10')
    : cn('text-text-secondary hover:text-text-primary focus:text-text-primary');
  if (disabled) {
    color = cn('text-text-muted');
  }

  return (
    <button
      type='button'
      onClick={() => onClick()}
      className={cn(
        'size-8 min-w-8 rounded-full border-none transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-action-neutralFocusOutline',
        color,
      )}
      disabled={disabled}
    >
      <Text small>{value}</Text>
    </button>
  );
};
