import { Ban } from 'lucide-react';
import { Button } from '@penumbra-zone/ui/Button';
import { Density } from '@penumbra-zone/ui/Density';
import { Text } from '@penumbra-zone/ui/Text';

interface BlockchainErrorProps {
  message?: string;
  onDetailsClick?: () => void;
}

export function BlockchainError({
  message = 'An error occurred when loading data from the blockchain',
  onDetailsClick,
}: BlockchainErrorProps) {
  return (
    <Density compact>
      <div className='flex flex-row items-center w-full justify-center gap-4 flex-wrap'>
        <Ban className='h-8 w-8 text-red-400' />
        <Text small color='text.secondary'>
          {message}
        </Text>
        <Button onClick={onDetailsClick}>Details</Button>
      </div>
    </Density>
  );
}
