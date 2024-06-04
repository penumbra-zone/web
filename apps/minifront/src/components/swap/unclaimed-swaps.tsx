import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { UnclaimedSwapsWithMetadata } from './swap-loader';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import { useStore } from '../../state';
import { useRevalidateUnclaimedSwaps, useUnclaimedSwaps } from '../../state/unclaimed-swaps';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';

export const UnclaimedSwaps = () => {
  const unclaimedSwaps = useUnclaimedSwaps();

  const sortedUnclaimedSwaps = (unclaimedSwaps.data ?? []).sort(
    (a, b) => Number(b.swap.outputData?.height) - Number(a.swap.outputData?.height),
  );
  return !unclaimedSwaps.data?.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <_UnclaimedSwaps unclaimedSwaps={sortedUnclaimedSwaps}></_UnclaimedSwaps>
  );
};

const _UnclaimedSwaps = ({ unclaimedSwaps }: { unclaimedSwaps: UnclaimedSwapsWithMetadata[] }) => {
  const revalidate = useRevalidateUnclaimedSwaps();
  const { claimSwap, isInProgress } = useStore(state => state.unclaimedSwaps);

  return (
    <Card layout>
      <GradientHeader layout>Unclaimed Swaps</GradientHeader>
      {unclaimedSwaps.map(({ swap, asset1, asset2 }) => {
        const id = uint8ArrayToBase64(getSwapRecordCommitment(swap).inner);

        return (
          <div key={id} className='mt-4 flex items-center gap-4 rounded-md border p-2'>
            <div className='flex items-center gap-2'>
              <AssetIcon metadata={asset1} />
              <p className='truncate'>{asset1.symbol || 'Unknown asset'}</p>
              <span>↔</span>
              <AssetIcon metadata={asset2} />
              <p className='truncate'>{asset2.symbol || 'Unknown asset'}</p>
            </div>

            <div className='hidden sm:block'>Block Height: {Number(swap.outputData?.height)}</div>

            <Button
              className='ml-auto w-20'
              onClick={() => void claimSwap(id, swap, revalidate)}
              disabled={isInProgress(id)}
            >
              {isInProgress(id) ? 'Claiming' : 'Claim'}
            </Button>
          </div>
        );
      })}
    </Card>
  );
};
