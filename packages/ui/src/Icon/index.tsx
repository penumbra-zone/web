import { LucideIcon } from 'lucide-react';
import { ComponentProps, FC } from 'react';
import { ThemeColor, getThemeColorClass } from '../utils/color';
import cn from 'clsx';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconProps {
  /**
   * The icon import from `lucide-react` to render.
   *
   * ```tsx
   * import { ChevronRight } from 'lucide-react';
   * <Icon IconComponent={ChevronRight} />
   * ```
   */
  IconComponent: LucideIcon | FC;
  /**
   * - `sm`: 16px square
   * - `md`: 24px square
   * - `lg`: 32px square
   */
  size: IconSize;
  /** A string representing the color key from the Tailwind theme (e.g. 'primary.light') */
  color?: ThemeColor;
}

const PROPS_BY_SIZE: Record<IconSize, ComponentProps<LucideIcon>> = {
  xs: {
    size: 10,
    strokeWidth: 1,
  },
  sm: {
    size: 16,
    strokeWidth: 1,
  },
  md: {
    size: 24,
    strokeWidth: 1.5,
  },
  lg: {
    size: 32,
    strokeWidth: 2,
  },
};

/**
 * Renders the Lucide icon passed in via the `IconComponent` prop. Use this
 * component rather than rendering Lucide icon components directly, since this
 * component standardizes the stroke width and sizes throughout the Penumbra
 * ecosystem.
 *
 * ```tsx
 * <Icon
 *   IconComponent={ArrowRightLeft}
 *   size='sm'
 *   color='text.primary'
 * />
 * ```
 */
export const Icon = ({ IconComponent, size = 'sm', color }: IconProps) => {
  return (
    <IconComponent
      absoluteStrokeWidth
      className={cn(color && getThemeColorClass(color).text)}
      color={!color ? 'currentColor' : undefined}
      {...PROPS_BY_SIZE[size]}
    />
  );
};
