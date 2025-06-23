import { ReactNode } from 'react';
import { detail, detailTechnical, small, smallTechnical } from '../utils/typography';
import { Density, useDensity } from '../utils/density';
import cn from 'clsx';

type Priority = 'primary' | 'secondary' | 'tertiary';
type Context =
  | 'default'
  | 'technical-default'
  | 'technical-success'
  | 'technical-caution'
  | 'technical-destructive';

const getFont = (context: Context, density: Density) => {
  if (density === 'slim') {
    return context === 'default' ? detail : detailTechnical;
  }
  if (density === 'compact') {
    return context === 'default' ? detail : detailTechnical;
  }
  return context === 'default' ? small : smallTechnical;
};

const getPadding = (priority: Priority, density: Density): string => {
  // main padding minus 1px or 2px for border width
  if (priority === 'secondary') {
    if (density === 'slim') {
      return 'pr-[3px] pl-[3px] py-0';
    }
    if (density === 'compact') {
      return 'pr-[7px] pl-[7px] py-0';
    }
    return 'pr-[10px] pl-[10px] py-[2px]';
  }

  if (density === 'slim') {
    return priority === 'tertiary' ? 'px-0 py-0' : 'pr-1 pl-1 py-0';
  }
  if (density === 'compact') {
    return 'pr-2 pl-2 py-0';
  }
  return 'pr-3 pl-3 py-1';
};

const getBackgroundColor = (priority: Priority, context: Context) => {
  if (priority === 'secondary' || priority === 'tertiary') {
    return 'bg-transparent';
  }

  const colorMap: Record<Context, string> = {
    default: cn('bg-other-tonal-fill10'),
    'technical-default': cn('bg-other-tonal-fill10'),
    'technical-success': cn('bg-secondary-light'),
    'technical-caution': cn('bg-caution-light'),
    'technical-destructive': cn('bg-destructive-light'),
  };
  return colorMap[context];
};

const getColor = (priority: Priority, context: Context): string => {
  if (priority === 'primary') {
    return context === 'default' || context === 'technical-default'
      ? cn('text-text-primary')
      : cn('text-secondary-dark');
  }

  const colorMap: Record<Context, string> = {
    default: cn('text-text-primary'),
    'technical-default': cn('text-text-primary'),
    'technical-success': cn('text-secondary-light'),
    'technical-caution': cn('text-caution-light'),
    'technical-destructive': cn('text-destructive-light'),
  };
  return colorMap[context];
};

export interface PillProps {
  children: ReactNode;
  priority?: Priority;
  context?: Context;
}

export const Pill = ({ children, priority = 'primary', context = 'default' }: PillProps) => {
  const density = useDensity();

  return (
    <span
      className={cn(
        getFont(context, density),
        getColor(priority, context),
        getBackgroundColor(priority, context),
        'box-border max-w-full w-max rounded-full',
        'inline-flex items-center',
        density !== 'slim' && 'gap-1',
        priority === 'secondary'
          ? `${density === 'sparse' ? 'border-2' : 'border'} border-dashed border-other-tonal-stroke`
          : 'border-none',
        getPadding(priority, density),
      )}
    >
      {children}
    </span>
  );
};
