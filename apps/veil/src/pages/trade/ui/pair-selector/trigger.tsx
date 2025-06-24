import { ChevronDown } from 'lucide-react';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Text } from '@penumbra-zone/ui/Text';
import { Pair } from '@/features/star-pair';

export interface TriggerProps {
  onClick: VoidFunction;
  pair: Pair;
}

export const Trigger = ({ onClick, pair }: TriggerProps) => {
  return (
    <Dialog.Trigger asChild>
      <button type='button' className='flex cursor-pointer items-center gap-1' onClick={onClick}>
        <div className='z-10'>
          <AssetIcon metadata={pair.base} size='lg' />
        </div>
        <div className='-ml-4'>
          <AssetIcon metadata={pair.quote} size='lg' />
        </div>

        <Text body>
          {pair.base.symbol}/{pair.quote.symbol}
        </Text>

        <i className='flex size-6 items-center justify-center p-1'>
          <ChevronDown />
        </i>
      </button>
    </Dialog.Trigger>
  );
};
