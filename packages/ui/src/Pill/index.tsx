import { ReactNode } from 'react';
import { body, technical, detail, detailTechnical } from '../utils/typography';
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
  if (context === 'default') {
    return density === 'sparse' ? body : detail;
  }
  return density === 'sparse' ? technical : detailTechnical;
};

const getXPadding = (priority: Priority, density: Density): string => {
  if (priority === 'secondary') {
    return density === 'sparse' ? 'pr-[10px] pl-[10px]' : 'pr-[6px] pl-[6px]';
  }
  return density === 'sparse' ? 'pr-3 pl-3' : 'pr-2 pl-2';
};

const getBackgroundColor = (priority: Priority, context: Context) => {
  if (priority === 'secondary' || priority === 'tertiary') {
    return 'bg-transparent';
  }

  const colorMap: Record<Context, string> = {
    default: cn('bg-other-tonalFill10'),
    'technical-default': cn('bg-other-tonalFill10'),
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
        'box-border inline-block max-w-full w-max rounded-full',
        priority === 'secondary'
          ? 'border-2 border-dashed border-other-tonalStroke'
          : 'border-none',
        priority === 'secondary' ? 'pt-[2px] pb-[2px]' : 'pt-1 pb-1',
        getXPadding(priority, density),
      )}
    >
      {children}
    </span>
  );
};
