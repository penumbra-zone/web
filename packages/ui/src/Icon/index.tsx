import { LucideIcon } from 'lucide-react';
import { ComponentProps } from 'react';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps {
  /**
   * The icon import from `lucide-react` to render.
   *
   * ```tsx
   * import { ChevronRight } from 'lucide-react';
   * <Icon IconComponent={ChevronRight} />
   * ```
   */
  IconComponent: LucideIcon;
  /**
   * - `sm`: 16px square
   * - `md`: 24px square
   * - `lg`: 48px square
   */
  size: IconSize;
  /**
   * The CSS color to render the icon with. If left undefined, will default to
   * the parent's text color (`currentColor` in SVG terms).
   */
  color?: string;
}

const PROPS_BY_SIZE: Record<IconSize, ComponentProps<LucideIcon>> = {
  sm: {
    size: 16,
    strokeWidth: 1,
  },
  md: {
    size: 24,
    strokeWidth: 1.5,
  },
  lg: {
    size: 48,
    strokeWidth: 2,
  },
};

/**
 * Renders the Lucide icon passed in via the `IconComponent` prop. Use this
 * component rather than rendering Lucide icon components directly, since this
 * component standardizes the stroke width and sizes throughout the Penumbra
 * ecosystem.
 */
export const Icon = ({ IconComponent, size = 'sm', color }: IconProps) => (
  <IconComponent absoluteStrokeWidth {...PROPS_BY_SIZE[size]} color={color} />
);
