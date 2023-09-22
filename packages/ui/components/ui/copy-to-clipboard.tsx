'use client';

import * as React from 'react';
import { useState } from 'react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface CopyToClipboardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  labelType?: 'text' | 'icon';
  label: React.ReactElement;
  isSuccessCopyText?: boolean;
}

const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({ text, className, label, isSuccessCopyText, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    return (
      <Button
        className={cn(copied && 'cursor-default text-teal-500 hover:no-underline', className)}
        variant='link'
        ref={ref}
        size='sm'
        onClick={() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
          void navigator.clipboard.writeText(text);
        }}
        {...props}
      >
        {copied ? (
          <span className={cn(isSuccessCopyText && 'flex items-center gap-2')}>
            {isSuccessCopyText && <span>Copied</span>}
            <CheckCircledIcon />
          </span>
        ) : (
          label
        )}
      </Button>
    );
  },
);
CopyToClipboard.displayName = 'CopyToClipboard';

export { CopyToClipboard };
