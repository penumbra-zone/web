import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../value';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Two-way swaps shouldn't ever really exist, as there's no point in swapping
 * assets back and forth in the same transaction.
 *
 * That said, they're technically possible in the Penumbra protocol, so some
 * client could create them. This component displays them in both directions,
 * ignoring any unfilled amount since that's basically irrelevant in a two-way
 * swap.
 */
export const TwoWaySwap = ({ swapView }: { swapView: SwapView }) => {
  if (swapView.swapView.case !== 'visible') return null;

  const { delta1I, delta2I } = swapView.swapView.value.swapPlaintext!;
  const { output1, output2, asset1Metadata, asset2Metadata } = swapView.swapView.value;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <ValueViewComponent
          view={
            new ValueView({
              valueView: {
                case: 'knownAssetId',
                value: {
                  amount: delta1I,
                  metadata: asset1Metadata,
                },
              },
            })
          }
        />

        <ArrowRight />

        <ValueViewComponent view={output2?.value} />
      </div>

      <div className='flex items-center gap-2'>
        <ValueViewComponent view={output1?.value} />

        <ArrowLeft />

        <ValueViewComponent
          view={
            new ValueView({
              valueView: {
                case: 'knownAssetId',
                value: {
                  amount: delta2I,
                  metadata: asset2Metadata,
                },
              },
            })
          }
        />
      </div>
    </div>
  );
};
