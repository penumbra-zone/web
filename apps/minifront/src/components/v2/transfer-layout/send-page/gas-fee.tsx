import { FormField } from '@penumbra-zone/ui/FormField';
import { Density } from '@penumbra-zone/ui/Density';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueViewComponent';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { FeeTier_Tier } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow.ts';
import { useStakingTokenMetadata } from '../../../../state/shared.ts';

const FEE_TIER_OPTIONS = [
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

const gasFeeSelector = (state: AllSlices) => ({
  fee: state.send.fee,
  feeTier: state.send.feeTier,
  assetFeeMetadata: state.send.assetFeeMetadata,
  setFeeTier: state.send.setFeeTier,
});

export const GasFee = () => {
  const {
    fee,
    feeTier,
    assetFeeMetadata,
    setFeeTier,
  } = useStoreShallow(gasFeeSelector);
  const { data: stakingTokenMetadata } = useStakingTokenMetadata();

  const feeMetadata = assetFeeMetadata ?? stakingTokenMetadata;

  const feeValueView = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: fee?.amount ?? { hi: 0n, lo: 0n },
        metadata: feeMetadata,
      },
    },
  });

  return (
    <FormField label='Fee Tier'>
      <Density compact>
        <SegmentedControl value={feeTier} onChange={setFeeTier} options={FEE_TIER_OPTIONS} />
      </Density>
      <ValueViewComponent valueView={feeValueView} />
    </FormField>
  );
};
