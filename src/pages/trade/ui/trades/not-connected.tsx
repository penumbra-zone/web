import { Wallet2 } from 'lucide-react';
import { ConnectButton } from '@/features/connect/connect-button';
import { Text } from '@penumbra-zone/ui/Text';

export const NotConnected = () => {
  return (
    <div className='flex flex-col items-center justify-center h-52 gap-4'>
      <div className='size-8 text-text-secondary'>
        <Wallet2 className='w-full h-full' />
      </div>
      <Text color='text.secondary' small>
        Connect wallet to see your trades
      </Text>
      <div className='w-fit'>
        <ConnectButton variant='minimal' actionType='default' />
      </div>
    </div>
  );
};
