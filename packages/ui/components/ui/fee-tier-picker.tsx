import { FeeTier_Tier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { SegmentedPicker, SegmentedPickerOption } from './segmented-picker';

const options: SegmentedPickerOption<FeeTier_Tier>[] = [
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

/**
 * Thin wrapper around `SegmentedPicker`, allowing users to choose which fee
 * tier they want to use.
 */
export const FeeTierPicker = ({
  value,
  onChange,
}: {
  value: FeeTier_Tier;
  onChange: (feeTier: FeeTier_Tier) => void;
}) => {
  return <SegmentedPicker value={value} onChange={onChange} options={options} />;
};
