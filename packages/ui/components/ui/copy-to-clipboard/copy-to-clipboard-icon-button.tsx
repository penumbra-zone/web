import { CopyIcon } from 'lucide-react';
import { CopyToClipboard } from './copy-to-clipboard';

/**
 * Wraps `CopyToClipboard` and passes in a `CopyIcon` as the label.
 */
export const CopyToClipboardIconButton = ({ text }: { text: string }) => {
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
    />
  );
};
