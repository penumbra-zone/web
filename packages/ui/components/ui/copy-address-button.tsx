import { CopyIcon } from 'lucide-react';
import { CopyToClipboard } from './copy-to-clipboard';

export const CopyAddressButton = ({ address }: { address: string }) => {
  return (
    <CopyToClipboard
      text={address}
      label={
        <div>
          <CopyIcon className='text-muted-foreground h-4 w-4 hover:opacity-50' />
        </div>
      }
      className='w-4'
    />
  );
};
