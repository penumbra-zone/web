import { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { Info } from 'lucide-react';
import { AssetIcon } from '@penumbra-zone/ui/AssetIcon';
import { pnum } from '@penumbra-zone/types/pnum';

import { useStakingStore } from '@/shared/stores/store-context';

export interface StakingStatProps {
  label: string;
  value: string;
  children?: ReactNode;
  helpText?: string;
}

export const StakingStat = ({ label, value, children, helpText }: StakingStatProps) => {
  const stakingStore = useStakingStore();
  const formattedValue = pnum(value, 2).toFormattedString({ trailingZeros: false });

  // Show skeleton while loading or when stakingTokenMetadata is not available
  const isLoading =
    stakingStore.loading || stakingStore.validatorsLoading || !stakingStore.stakingTokenMetadata;

  if (isLoading) {
    return (
      <div className='flex flex-col gap-1 w-full'>
        <div className='flex items-center gap-1'>
          <Text color='text.secondary' xs>
            {label}
          </Text>
          {helpText && (
            <Tooltip message={helpText}>
              <Info size={12} className='text-text-secondary' />
            </Tooltip>
          )}
        </div>
        <div className='flex items-center gap-2 rounded-sm bg-other-tonal-fill5 p-3'>
          {/* Skeleton for Penumbra asset/token logo */}
          <div className='flex justify-center mb-1'>
            <div className='w-10 h-10 rounded-full'>
              <Skeleton circular />
            </div>
          </div>
          <div className='flex flex-col justify-start gap-1 flex-1'>
            <div className='h-4 w-24'>
              <Skeleton />
            </div>
            <div className='h-3 w-20'>
              <Skeleton />
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-1 w-full'>
      <div className='flex items-center gap-1'>
        <Text color='text.secondary' xs>
          {label}
        </Text>
        {helpText && (
          <Tooltip message={helpText}>
            <Info size={12} className='text-text-secondary' />
          </Tooltip>
        )}
      </div>
      <div className='flex items-center gap-2 rounded-sm bg-other-tonal-fill5 p-3'>
        {/* Penumbra asset/token logo */}
        <div className='flex justify-center mb-1'>
          <AssetIcon size='lg' metadata={stakingStore.stakingTokenMetadata} zIndex={undefined} />
        </div>
        <div className='flex flex-col justify-start whitespace-nowrap'>
          <div className='flex size-fit'>
            <Text color='text.primary' body>
              {formattedValue} UM
            </Text>
          </div>
          <div className='flex size-fit'>
            <Text detail color='text.secondary'>
              Penumbra
            </Text>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
