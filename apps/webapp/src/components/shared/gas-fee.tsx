import {
  Fee,
  FeeTier_Tier,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1alpha1/fee_pb';
import { FeeTierSelector } from '@penumbra-zone/ui';
import { InputBlock } from './input-block';
import { joinLoHiAmount } from '@penumbra-zone/types';

const PENUMBRA_DISPLAY_DENOMINATOR = 1_000_000;

const getFeeAsString = (fee: Fee | undefined) => {
  if (!fee?.amount) return '';
  return `${(Number(joinLoHiAmount(fee.amount)) / PENUMBRA_DISPLAY_DENOMINATOR).toString()} penumbra`;
};

export const GasFee = ({
  fee,
  feeTier,
  setFeeTier,
}: {
  fee: Fee | undefined;
  feeTier: FeeTier_Tier;
  setFeeTier: (feeTier: FeeTier_Tier) => void;
}) => {
  const feeAsString = getFeeAsString(fee);

  return (
    // @todo: Rename 'Fee tier' to 'Gas fee' if/when we support manual fee entry
    <InputBlock label='Fee tier' value={feeTier} orientation='horizontal'>
      <div className='flex flex-row items-center justify-between gap-4'>
        {feeAsString && <span className='text-teal'>{feeAsString}</span>}

        <FeeTierSelector value={feeTier} onChange={setFeeTier} />
      </div>
    </InputBlock>
  );
};
