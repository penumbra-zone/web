import { Wallet2 } from 'lucide-react';
import { ConnectButton } from '@/features/connect/connect-button';
import { Text } from '@penumbra-zone/ui/Text';

export const NotConnectedNotice = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <div className='size-8 text-text-secondary'>
        <Wallet2 className='h-full w-full' />
      </div>
      <Text color='text.secondary' small>
        Connect wallet to see your positions
      </Text>
      <div className='w-fit'>
        <ConnectButton variant='minimal' actionType='default' />
      </div>
    </div>
  );
};
