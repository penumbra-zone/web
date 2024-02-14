import { Button, Card } from '@penumbra-zone/ui';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { SwapLoaderResponse } from './swap-loader.tsx';
import { AssetIcon } from '../shared/asset-icon.tsx';
import { getSwapRecordCommitment, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { useStore } from '../../state';
import { unclaimedSwapsSelector } from '../../state/unclaimed-swaps.ts';

export const UnclaimedSwaps = () => {
  const { revalidate } = useRevalidator();
  const { claimSwap, isInProgress } = useStore(unclaimedSwapsSelector);

  const { unclaimedSwaps } = useLoaderData() as SwapLoaderResponse;
  if (!unclaimedSwaps.length) return <></>;

  return (
    <Card className=''>
      <p className='bg-text-linear bg-clip-text font-headline text-xl font-semibold leading-[30px] text-transparent md:text-2xl md:font-bold md:leading-9'>
        Unclaimed Swaps
      </p>
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
