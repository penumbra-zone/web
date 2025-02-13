'use client';

import * as React from 'react';
import { cn } from './utils/cn';
import { IncognitoIcon } from './icons/incognito';

export interface ViewBoxProps {
  label: string;
  visibleContent?: React.ReactElement;
  isOpaque?: boolean;
}

const Label = ({ label }: { label: string }) => <span className='text-lg'>{label}</span>;

export const ViewBox = ({ label, visibleContent, isOpaque }: ViewBoxProps) => {
  // if isOpaque is undefined, set it to !visibleContent
  const opaque = isOpaque ?? !visibleContent;
  return (
    <div className='overflow-x-hidden'>
      <div
        className={cn(
          'flex flex-col gap-1 break-all overflow-hidden',
          opaque ? 'cursor-not-allowed' : '',
        )}
      >
        <div className='flex items-center gap-2 self-start'>
          <span className={cn('text-base font-bold', opaque ? 'text-gray-600' : '')}>
            {!opaque && <Label label={label} />}
            {opaque && (
              <div className='flex gap-2'>
                <IncognitoIcon fill='#4b5563' />
                <Label label={label} />
              </div>
            )}
          </span>
        </div>
        {visibleContent}
      </div>
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
