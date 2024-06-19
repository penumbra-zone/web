import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { SegmentedPicker, SegmentedPickerOption } from '@repo/ui/components/ui/segmented-picker';
import { InputBlock } from './input-block';
import { ValueViewComponent } from '@repo/ui/components/ui/tx/view/value';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const FEE_TIER_OPTIONS: SegmentedPickerOption<FeeTier_Tier>[] = [
  {
    label: 'Low',
    value: FeeTier_Tier.LOW,
  },
  {
    label: 'Medium',
    value: FeeTier_Tier.MEDIUM,
  },
  {
    label: 'High',
    value: FeeTier_Tier.HIGH,
  },
];

export const GasFee = ({
  fee,
  feeTier,
  stakingAssetMetadata,
  setFeeTier,
}: {
  fee: Fee | undefined;
  feeTier: FeeTier_Tier;
  stakingAssetMetadata?: Metadata;
  setFeeTier: (feeTier: FeeTier_Tier) => void;
}) => {
  if (!stakingAssetMetadata) return null;

  let feeValueView: ValueView | undefined;
  if (fee?.amount)
    feeValueView = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: { amount: fee.amount, metadata: stakingAssetMetadata },
      },
    });

  return (
    /**
     * @todo: Change label from 'Fee tier' to 'Gas fee' if/when we support
     * manual fee entry.
     */
    <InputBlock label='Fee tier' value={feeTier}>
      <div className='flex flex-col gap-2'>
        <SegmentedPicker value={feeTier} options={FEE_TIER_OPTIONS} onChange={setFeeTier} />

        {feeValueView && (
          <div className='flex flex-row items-center gap-2'>
            <img src='./fuel.svg' alt='Gas fee' className='size-5' />

            <ValueViewComponent view={feeValueView} />
          </div>
        )}
      </div>
    </InputBlock>
  );
};
