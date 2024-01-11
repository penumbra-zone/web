import { CopyIcon } from 'lucide-react';
import { CopyToClipboard } from './copy-to-clipboard';

export const CopyAddressButton = ({ address }: { address: string }) => {
  return (
    <CopyToClipboard
      text={address}
      label={<CopyIcon className='text-muted-foreground h-4 w-4 hover:opacity-50' />}
      className='h-4 w-4'
    />
  );
};
