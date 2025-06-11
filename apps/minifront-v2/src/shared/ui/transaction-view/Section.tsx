import React, { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';

export interface SectionProps {
  sectionTitle?: ReactNode;
  children: ReactNode;
  className?: string;
  layout?: 'boxed' | 'transparent';
  titleAdornment?: ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  sectionTitle,
  children,
  className = '',
  layout = 'boxed',
  titleAdornment,
}) => (
  <section className={`flex flex-col gap-1 ${className}`}>
    {sectionTitle && (
      <div className='flex items-center'>
        <Text color='text.primary' xs>
          {sectionTitle}
        </Text>
        {titleAdornment && <div className='ml-2'>{titleAdornment}</div>}
      </div>
    )}
    {layout === 'boxed' ? (
      <div className='flex w-full min-h-10 rounded-sm bg-other-tonalFill5 px-3 py-2'>
        <div className='flex-1 w-full'>{children}</div>
      </div>
    ) : (
      <>{children}</>
    )}
  </section>
);
