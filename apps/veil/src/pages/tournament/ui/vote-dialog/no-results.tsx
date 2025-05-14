import { Search } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';

export const VotingDialogNoResults = () => {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-text-secondary gap-2'>
      <Search className='size-8' />
      <Text small>No results</Text>
    </div>
  );
};
