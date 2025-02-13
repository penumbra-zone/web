import { ViewBox } from '../../viewbox';
import { SwapClaimView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from './transaction-id';
import { ActionDetails } from '../action-details';
import {
  getOutput1Value,
  getOutput2Value,
  getSwapClaimFee,
} from '@penumbra-zone/getters/swap-claim-view';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { getAmount as getAmountFee } from '@penumbra-zone/getters/fee';
import { isZero, joinLoHiAmount } from '@penumbra-zone/types/amount';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

const getClaimLabel = (
  output1Amount?: Amount,
  output2Amount?: Amount,
): 'Claimed Amount' | 'Claimed Amounts' => {
  if (!output1Amount || !output2Amount) {
    return 'Claimed Amount';
  }
  if (isZero(output1Amount) || isZero(output2Amount)) {
    return 'Claimed Amount';
  }

  return 'Claimed Amounts';
};

export const SwapClaimViewComponent = ({ value }: { value: SwapClaimView }) => {
  if (value.swapClaimView.case === 'visible') {
    const swapTxId = value.swapClaimView.value.swapTx;
    const output1Value = getOutput1Value.optional(value);
    const output2Value = getOutput2Value.optional(value);
    const output1Amount = getAmount.optional(output1Value);
    const output2Amount = getAmount.optional(output2Value);
    const claimLabel = getClaimLabel(output1Amount, output2Amount);

    return (
      <ViewBox
        label='Swap Claim'
        visibleContent={
          <ActionDetails>
            <ActionDetails.Row label={claimLabel}>
              <div className='flex gap-2'>
                {output1Amount && !isZero(output1Amount) && (
                  <ValueViewComponent valueView={output1Value} />
                )}
                {output2Amount && !isZero(output2Amount) && (
                  <ValueViewComponent valueView={output2Value} />
                )}
              </div>
            </ActionDetails.Row>

            {swapTxId && (
              <ActionDetails.Row label='Swap Transaction'>
                <TransactionIdComponent transactionId={swapTxId} />
              </ActionDetails.Row>
            )}
          </ActionDetails>
        }
      />
    );
  }

  if (value.swapClaimView.case === 'opaque') {
    const claimFee = getSwapClaimFee(value);

    return (
      <ViewBox
        label='Swap'
        visibleContent={
          <div className='flex flex-col gap-4'>
            <ActionDetails>
              <ActionDetails.Row label='Prepaid Claim Fee'>
                <div className='font-mono'>
                  {joinLoHiAmount(getAmountFee(claimFee)).toString()} upenumbra
                </div>
              </ActionDetails.Row>
            </ActionDetails>
          </div>
        }
      />
    );
  }

  return <div>Invalid SpendView</div>;
};
