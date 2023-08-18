'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@ui/components';
import { cn } from '@ui/lib/utils';
import { CheckCircledIcon } from '@radix-ui/react-icons';

export interface CopyToClipboardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({ text, className, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    return (
      <Button
        className={cn(
          'm-auto w-48',
          copied ? 'cursor-default text-teal-500 hover:no-underline' : 'text-white',
          className,
        )}
        variant='link'
        ref={ref}
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
          <span className='flex gap-2'>
            <span>Copied</span>
            <CheckCircledIcon />
          </span>
        ) : (
          'Copy to clipboard'
        )}
      </Button>
    );
  },
);
CopyToClipboard.displayName = 'CopyToClipboard';

export { CopyToClipboard };
