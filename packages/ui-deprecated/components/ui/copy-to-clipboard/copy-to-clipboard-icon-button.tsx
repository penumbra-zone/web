import { CopyIcon } from 'lucide-react';
import { CopyToClipboard, CopyToClipboardProps } from './copy-to-clipboard';
import * as React from 'react';

export interface CopyToClipboardIconButtonProps extends Pick<CopyToClipboardProps, 'text'> {
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Wraps `CopyToClipboard` and passes in a `CopyIcon` as the label.
 */
export const CopyToClipboardIconButton = ({ text, ref }: CopyToClipboardIconButtonProps) => {
  return (
    <CopyToClipboard
      text={text}
      label={
        <CopyIcon
          className='size-4 hover:opacity-50'
          data-testid='CopyToClipboardIconButton__icon'
        />
      }
      successLabel={null}
      className='size-4'
      ref={ref}
    />
  );
};

CopyToClipboardIconButton.displayName = 'CopyToClipboardIconButton';
