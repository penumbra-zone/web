import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { PriceImpact } from './price-impact';
import { motion } from 'framer-motion';
import { SimulateSwapResult as TSimulateSwapResult } from '../../../../state/swap';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import {
  getAmount,
  getDisplayDenomExponentFromValueView,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { Traces } from './traces';
import { AllSlices } from '../../../../state';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { toBaseUnit } from '@penumbra-zone/types/lo-hi';
import BigNumber from 'bignumber.js';
import { useStoreShallow } from '../../../../utils/use-store-shallow';

const HIDE = { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' };
const SHOW = { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' };

const simulateSwapResultSelector = (state: AllSlices) => ({
  input: new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: toBaseUnit(
          new BigNumber(state.swap.amount),
          getDisplayDenomExponentFromValueView.optional()(state.swap.assetIn?.balanceView),
        ),
        metadata: getMetadata.optional()(state.swap.assetIn?.balanceView),
      },
    },
  }),
});

export const SimulateSwapResult = ({ result }: { result: TSimulateSwapResult }) => {
  const { unfilled, output, priceImpact, traces, metadataByAssetId } = result;
  const { input } = useStoreShallow(simulateSwapResultSelector);

  const hasUnfilled = joinLoHiAmount(getAmount(unfilled)) > 0n;

  return (
    <motion.div layout initial={HIDE} animate={SHOW} exit={HIDE} className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-1'>
        Filling <ValueViewComponent view={output} size='sm' /> causes a price impact of{' '}
        <PriceImpact amount={priceImpact} />.
        {hasUnfilled && (
          <>
            <ValueViewComponent view={unfilled} size='sm' /> will remain unfilled.
          </>
        )}
      </div>

      <Traces traces={traces} metadataByAssetId={metadataByAssetId} input={input} output={output} />
    </motion.div>
  );
};
