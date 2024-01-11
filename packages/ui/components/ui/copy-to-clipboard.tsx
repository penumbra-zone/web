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
}

const CopyToClipboard = React.forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({ text, className, label, ...props }, ref) => {
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
        {copied ? <CheckCircledIcon /> : label}
      </Button>
    );
  },
);
CopyToClipboard.displayName = 'CopyToClipboard';

export { CopyToClipboard };
