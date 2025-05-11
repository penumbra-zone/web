import { Text } from '@penumbra-zone/ui/Text';
import { List } from 'lucide-react';

export const NoPositions = () => {
  return (
    <div className='flex flex-col gap-4 items-center justify-center min-h-[250px] pt-5'>
      <List className='size-8 text-neutral-light' />
      <Text small color='text.secondary'>
        You have no positions yet
      </Text>
    </div>
  );
};
