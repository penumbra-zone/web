'use client';

import * as React from 'react';
import { cn } from '../../../../lib/utils';
import { IncognitoIcon } from '../../icons/incognito';

const Encrypted = () => {
  return (
    <div className='flex gap-2'>
      <span>==</span>
      <span className='italic'>Encrypted</span>
      <IncognitoIcon fill='#4b5563' />
      <span>==</span>
    </div>
  );
};

export interface ViewBoxProps {
  label: string;
  visibleContent?: React.ReactElement;
}

export const ViewBox = ({ label, visibleContent }: ViewBoxProps) => {
  return (
    <div
      className={cn(
        'bg-background px-4 pt-3 pb-4 rounded-lg border flex flex-col gap-1',
        !visibleContent && 'cursor-not-allowed text-gray-600'
      )}
    >
      <div className='flex items-center gap-2 self-start'>
        <span className={'text-base font-bold'}>
          {label}
        </span>
      </div>
      {visibleContent || <Encrypted />}
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
