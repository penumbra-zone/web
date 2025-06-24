import { Search } from 'lucide-react';
import { Text } from '@penumbra-zone/ui/Text';

export const VotingDialogNoResults = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-2 py-20 text-text-secondary'>
      <Search className='size-8' />
      <Text small>No results</Text>
    </div>
  );
};
