'use client';

import * as React from 'react';
import { cn } from '../../../../lib/utils';
import { IncognitoIcon } from '../../icons/incognito';
import { Box } from '../../box';
import { motion } from 'framer-motion';

export interface ViewBoxProps {
  label: string;
  visibleContent?: React.ReactElement;
  isOpaque?: boolean;
  layoutId?: string;
}

const Label = ({ label }: { label: string }) => <span className='text-lg'>{label}</span>;

export const ViewBox = ({ label, visibleContent, isOpaque, layoutId }: ViewBoxProps) => {
  // if isOpaque is undefined, set it to !visibleContent
  isOpaque = isOpaque ?? !visibleContent;
  return (
    <Box layoutId={layoutId}>
      <div
        className={cn(
          'flex flex-col gap-1 break-all overflow-hidden',
          isOpaque ? 'cursor-not-allowed' : '',
        )}
      >
        <div className='flex items-center gap-2 self-start'>
          <span className={cn('text-base font-bold', isOpaque ? 'text-gray-600' : '')}>
            {!isOpaque && (
              <motion.div layout layoutId={layoutId ? `${layoutId}.label` : undefined}>
                <Label label={label} />
              </motion.div>
            )}
            {isOpaque && (
              <motion.div
                layout
                layoutId={layoutId ? `${layoutId}.label` : undefined}
                className='flex gap-2'
              >
                <IncognitoIcon fill='#4b5563' />
                <Label label={label} />
              </motion.div>
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
  layoutId?: string;
}

export const ViewSection = ({ heading, children, layoutId }: ViewSectionProps) => {
  return (
    <div className='grid gap-4'>
      <motion.div
        layout
        layoutId={layoutId ? `${layoutId}.heading` : undefined}
        className='text-xl font-bold'
      >
        {heading}
      </motion.div>
      {children}
    </div>
  );
};
