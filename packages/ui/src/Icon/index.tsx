import { LucideIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { DefaultTheme, useTheme } from 'styled-components';

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
   * - `lg`: 32px square
   */
  size: IconSize;
  /**
   * A function that takes the `theme` object, and returns a CSS color to render
   * the icon with. If left undefined, will default to the parent's text color
   * (`currentColor` in SVG terms).
   */
  color?: (theme: DefaultTheme) => string;
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
 *   color={theme => theme.colors.primary.main}
 * />
 * ```
 */
export const Icon = ({ IconComponent, size = 'sm', color }: IconProps) => {
  const theme = useTheme();
  const resolvedColor = color ? color(theme) : 'currentColor';

  return <IconComponent absoluteStrokeWidth {...PROPS_BY_SIZE[size]} color={resolvedColor} />;
};
