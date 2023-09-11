'use client';

import * as React from 'react';
import { useState } from 'react';
import { CheckCircledIcon, CopyIcon } from '@radix-ui/react-icons';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface CopyToClipboardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  childType?: 'text' | 'icon';
}

const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({ text, childType = 'text', className, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    return (
      <Button
        className={cn(
          childType === 'text' ? 'm-auto w-48' : 'w-4',
          copied && 'cursor-default text-teal-500 hover:no-underline',
          className,
        )}
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
          <span className={cn(childType === 'text' && 'flex items-center gap-2')}>
            {childType === 'text' && <span>Copied</span>}
            <CheckCircledIcon />
          </span>
        ) : childType === 'text' ? (
          'Copy to clipboard'
        ) : (
          <div>
            <CopyIcon className='h-4 w-4 text-foreground hover:opacity-50' />
          </div>
        )}
      </Button>
    );
  },
);
CopyToClipboard.displayName = 'CopyToClipboard';

export { CopyToClipboard };
