'use client';

import { ReactNode, ButtonHTMLAttributes, useState, forwardRef } from 'react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Button } from '../button';
import { cn } from '../../../lib/utils';

export interface CopyToClipboardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  labelType?: 'text' | 'icon';
  label: ReactNode;
  successLabel?: ReactNode;
}

const CopyToClipboard = forwardRef<HTMLButtonElement, CopyToClipboardProps>(
  ({ text, className, label, successLabel, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    return (
      <Button
        type='button'
        className={cn(
          copied && 'cursor-default text-teal-500 hover:no-underline',
          'block px-0',
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
          <span className='flex items-center gap-2'>
            {successLabel ?? <span className='whitespace-nowrap'>Copied</span>}
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
