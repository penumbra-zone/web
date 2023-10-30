'use client';

import * as React from 'react';
import { cn } from '../../../../lib/utils';
import { IncognitoIcon } from '../../icons/incognito';

export interface ViewBoxProps {
  label: string;
  visibleContent?: React.ReactElement;
}

export const ViewBox = ({ label, visibleContent }: ViewBoxProps) => {
  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        !visibleContent ? 'cursor-not-allowed' : '',
      )}
    >
      <div className='flex items-center gap-2 self-start'>
        <span className={cn('text-base font-bold', !visibleContent ? 'text-gray-600' : '')}>
          {visibleContent && label}
          {!visibleContent && (
            <div className='flex gap-2'>
              <IncognitoIcon fill='#4b5563' />
              <span>{label}</span>
            </div>
          )}
        </span>
      </div>
      {visibleContent}
    </div>
  );
};

export interface ViewSectionProps {
  heading: string;
  children?: React.ReactNode;
}

export const ViewSection = ({ heading, children }: ViewSectionProps) => {
  return (
    <div className='grid gap-4'>
      <div className='text-xl font-bold'>{heading}</div>
      {children}
    </div>
  );
};
