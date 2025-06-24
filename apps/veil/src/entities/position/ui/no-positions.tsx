import { Text } from '@penumbra-zone/ui/Text';
import { List } from 'lucide-react';

export const NoPositions = () => {
  return (
    <div className='flex min-h-[250px] flex-col items-center justify-center gap-4 pt-5'>
      <List className='size-8 text-neutral-light' />
      <Text small color='text.secondary'>
        You have no positions yet
      </Text>
    </div>
  );
};
