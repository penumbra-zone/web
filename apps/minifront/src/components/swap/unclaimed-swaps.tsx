import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import { AllSlices } from '../../state';
import { useUnclaimedSwaps } from '../../state/unclaimed-swaps';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { useStoreShallow } from '../../utils/use-store-shallow';

const unclaimedSwapsSelector = (state: AllSlices) => ({
  claimSwap: state.unclaimedSwaps.claimSwap,
  isInProgress: state.unclaimedSwaps.isInProgress,
});

export const UnclaimedSwaps = () => {
  const unclaimedSwaps = useUnclaimedSwaps();
  const { claimSwap, isInProgress } = useStoreShallow(unclaimedSwapsSelector);

  return !unclaimedSwaps.data?.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <Card layout>
      <GradientHeader layout>Unclaimed Swaps</GradientHeader>
      <p className='text-gray-400'>
        Swaps on Penumbra are a two step process. The first transaction issues the request and the
        second claims the result of the swap action. For some reason, these second transactions were
        not completed. Claim them!
      </p>
      {unclaimedSwaps.data.map(({ swap, asset1, asset2 }) => {
        const id = uint8ArrayToBase64(getSwapRecordCommitment(swap).inner);

        return (
          <div key={id} className='mt-4 flex justify-between'>
            <div className='flex flex-col gap-2'>
              <div>Block Height: {Number(swap.outputData?.height)}</div>
              <div className='flex items-center gap-2'>
                <AssetIcon metadata={asset1} />
                <span>↔</span>
                <AssetIcon metadata={asset2} />
              </div>
            </div>
            <Button
              className='w-20'
              onClick={() => void claimSwap(id, swap)}
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
