import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { FeeTierSelector } from '@penumbra-zone/ui';
import { InputBlock } from './input-block';
import { localAssets } from '@penumbra-zone/constants';
import { ValueViewComponent } from '@penumbra-zone/ui/components/ui/tx/view/value';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

const PENUMBRA_DENOM_METADATA = localAssets.find(asset => asset.display === 'penumbra')!;

export const GasFee = ({
  fee,
  feeTier,
  setFeeTier,
}: {
  fee: Fee | undefined;
  feeTier: FeeTier_Tier;
  setFeeTier: (feeTier: FeeTier_Tier) => void;
}) => {
  let feeValueView: ValueView | undefined;
  if (fee?.amount)
    feeValueView = new ValueView({
      valueView: {
        case: 'knownDenom',
        value: { amount: fee.amount, denom: PENUMBRA_DENOM_METADATA },
      },
    });

  return (
    // @todo: Rename 'Fee tier' to 'Gas fee' if/when we support manual fee entry
    <InputBlock label='Fee tier' value={feeTier}>
      <div className='flex flex-col gap-2'>
        <FeeTierSelector value={feeTier} onChange={setFeeTier} />

        {feeValueView && (
          <div className='flex flex-row items-center gap-2'>
            <img src='/fuel.svg' alt='Gas fee' className='size-5' />

            <ValueViewComponent view={feeValueView} />
          </div>
        )}
      </div>
    </InputBlock>
  );
};
