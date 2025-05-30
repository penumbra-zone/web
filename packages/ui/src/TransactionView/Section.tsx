import React, { ReactNode } from 'react';
import { Text } from '../Text'; // Updated path

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
  <section className={`flex flex-col gap-1  ${className}`}>
    {sectionTitle && (
      <div className='flex items-center'>
        <Text color='text.primary' xs>
          {sectionTitle}
        </Text>
        {titleAdornment && <div className='ml-2'>{titleAdornment}</div>}
      </div>
    )}
    {layout === 'boxed' ? (
      <div className='rounded-sm bg-other-tonalFill5 p-3 py-2'>{children}</div>
    ) : (
      <div>{children}</div>
    )}
  </section>
);
