import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { AssetIcon } from '@repo/ui/components/ui/asset-icon';
import { AllSlices } from '../../state';
import { useUnclaimedSwaps } from '../../state/unclaimed-swaps';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { GradientHeader } from '@repo/ui/components/ui/gradient-header';
import { useStoreShallow } from '../../utils/use-store-shallow';
import { useState } from 'react';

const unclaimedSwapsSelector = (state: AllSlices) => ({
  claimSwap: state.unclaimedSwaps.claimSwap,
  isInProgress: state.unclaimedSwaps.isInProgress,
});

export const UnclaimedSwaps = () => {
  const unclaimedSwaps = useUnclaimedSwaps();
  const { claimSwap, isInProgress } = useStoreShallow(unclaimedSwapsSelector);
  const [claim, setClaim] = useState<string[]>([]);

  // Internal state management for tracking the IDs of the swaps that are currently being claimed.
  const handleClaim = async (id: string, swap: any) => {
    setClaim(previous => [...previous, id]);
    await claimSwap(id, swap);
  };

  return !unclaimedSwaps.data?.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <Card layout>
      <GradientHeader layout>Unclaimed Swaps</GradientHeader>
      {unclaimedSwaps.data.map(({ swap, asset1, asset2 }) => {
        const id = uint8ArrayToBase64(getSwapRecordCommitment(swap).inner);
        const isClaiming = claim.includes(id) || isInProgress(id);

        return (
          <div key={id} className='mt-4 flex items-center gap-4 rounded-md border p-2'>
            <div className='flex items-center gap-2'>
              <AssetIcon metadata={asset1} />
              <p className='max-w-40 truncate'>{asset1.symbol || 'Unknown asset'}</p>
              <span>↔</span>
              <AssetIcon metadata={asset2} />
              <p className='max-w-40 truncate'>{asset2.symbol || 'Unknown asset'}</p>
            </div>

            <div className='hidden sm:block'>Block Height: {Number(swap.outputData?.height)}</div>

            <Button
              className='ml-auto w-20'
              onClick={() => void handleClaim(id, swap)}
              disabled={isClaiming}
            >
              {isClaiming ? 'Claiming' : 'Claim'}
            </Button>
          </div>
        );
      })}
    </Card>
  );
};
