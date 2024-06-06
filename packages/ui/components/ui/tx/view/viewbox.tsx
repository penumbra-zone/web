'use client';

import * as React from 'react';
import { cn } from '../../../../lib/utils';
import { IncognitoIcon } from '../../icons/incognito';
import { Box } from '../../box';

export interface ViewBoxProps {
  label: string;
  visibleContent?: React.ReactElement;
  isOpaque?: boolean;
}

const Label = ({ label }: { label: string }) => <span className='text-lg'>{label}</span>;

export const ViewBox = ({ label, visibleContent, isOpaque }: ViewBoxProps) => {
  // if isOpaque is undefined, set it to !visibleContent
  isOpaque = isOpaque ?? !visibleContent;
  return (
    <Box overflow='xHidden'>
      <div
        className={cn(
          'flex flex-col gap-1 break-all overflow-hidden',
          isOpaque ? 'cursor-not-allowed' : '',
        )}
      >
        <div className='flex items-center gap-2 self-start'>
          <span className={cn('text-base font-bold', isOpaque ? 'text-gray-600' : '')}>
            {!isOpaque && <Label label={label} />}
            {isOpaque && (
              <div className='flex gap-2'>
                <IncognitoIcon fill='#4b5563' />
                <Label label={label} />
              </div>
            )}
          </span>
        </div>
        {visibleContent}
      </div>
    </Box>
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
