import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Card } from '@penumbra-zone/ui/components/ui/card';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { SwapLoaderResponse, UnclaimedSwapsWithMetadata } from './swap-loader';
import { AssetIcon } from '@penumbra-zone/ui/components/ui/tx/view/asset-icon';
import { useStore } from '../../../state';
import { unclaimedSwapsSelector } from '../../../state/unclaimed-swaps';
import { getSwapRecordCommitment } from '@penumbra-zone/getters/swap-record';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';

export const UnclaimedSwaps = () => {
  const { unclaimedSwaps } = useLoaderData() as SwapLoaderResponse;

  const sortedUnclaimedSwaps = unclaimedSwaps.sort(
    (a, b) => Number(b.swap.outputData?.height) - Number(a.swap.outputData?.height),
  );
  return !unclaimedSwaps.length ? (
    <div className='hidden xl:block'></div>
  ) : (
    <_UnclaimedSwaps unclaimedSwaps={sortedUnclaimedSwaps}></_UnclaimedSwaps>
  );
};

const _UnclaimedSwaps = ({ unclaimedSwaps }: { unclaimedSwaps: UnclaimedSwapsWithMetadata[] }) => {
  const { revalidate } = useRevalidator();
  const { claimSwap, isInProgress } = useStore(unclaimedSwapsSelector);

  return (
    <Card className='order-1 md:order-3 xl:order-1'>
      <GradientHeader>Unclaimed Swaps</GradientHeader>
      <p className='text-gray-400'>
        Swaps on Penumbra are a two step process. The first transaction issues the request and the
        second claims the result of the swap action. For some reason, these second transactions were
        not completed. Claim them!
      </p>
      {unclaimedSwaps.map(({ swap, asset1, asset2 }) => {
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
