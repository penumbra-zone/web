import { LucideIcon } from 'lucide-react';
import cn from 'clsx';
import { Icon, IconSize } from '../Icon';

export type IconAdornmentSize = 'sm' | 'xs';

export interface IconAdornmentProps {
  /**
   * The icon import from `lucide-react` to render.
   *
   * ```tsx
   * import { Shield } from 'lucide-react';
   * <IconAdornment icon={Shield} size="sm" />
   * ```
   */
  icon: LucideIcon;
  /**
   * Size of the icon adornment:
   * - `sm`: 24x24px container with 16px icon
   * - `xs`: 12x12px container with 8px icon
   */
  size: IconAdornmentSize;
  /**
   * Whether the icon adornment is disabled
   */
  disabled?: boolean;
  /**
   * Click handler for the icon adornment
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const getSizeClasses = (size: IconAdornmentSize): string => {
  switch (size) {
    case 'sm':
      return cn('size-6 p-1'); // 24x24 with 4px padding
    case 'xs':
      return cn('size-3 p-0.5'); // 12x12 with 2px padding
  }
};

const getIconSize = (size: IconAdornmentSize): IconSize => {
  switch (size) {
    case 'sm':
      return 'sm'; // 16px
    case 'xs':
      return 'xs'; // 10px (closest to 8px)
  }
};

/**
 * IconAdornment component renders a small icon in a rounded container with various interactive states.
 * Based on the Figma design with support for different sizes and interaction states.
 *
 * ```tsx
 * <IconAdornment
 *   icon={Shield}
 *   size="sm"
 *   actionType="default"
 *   priority="light"
 * />
 * ```
 */
export const IconAdornment = ({
  icon: IconComponent,
  size,
  disabled = false,
  onClick,
  className,
}: IconAdornmentProps) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'relative flex items-center justify-center rounded-full border border-transparent focus:border-action-focus-outline transition-colors duration-150',

        // Size-specific styles
        getSizeClasses(size),

        // Interactive states (only when not disabled and clickable)
        !disabled &&
          onClick && [
            'cursor-pointer',
            'hover:bg-action-hover-overlay',
            'active:bg-action-active-overlay', // Using this for pressed state
          ],

        className,
      )}
    >
      <Icon
        IconComponent={IconComponent}
        size={getIconSize(size)}
        color={disabled ? 'text.muted' : 'neutral.light'}
      />
    </Component>
  );
};

IconAdornment.displayName = 'IconAdornment';
