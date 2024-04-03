import { ViewBox } from './viewbox';
import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { TransactionIdComponent } from './transaction-id';
import { ActionDetails } from './action-details';
import {
  getOutput1ValueOptional,
  getOutput2ValueOptional,
} from '@penumbra-zone/getters/src/swap-claim-view';
import { getAmount } from '@penumbra-zone/getters/src/value-view';
import { isZero } from '@penumbra-zone/types/src/amount';
import { ValueViewComponent } from './value';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { UnimplementedView } from './unimplemented-view';

const getClaimLabel = (
  output1Amount?: Amount,
  output2Amount?: Amount,
): 'Claimed amount' | 'Claimed amounts' => {
  if (!output1Amount || !output2Amount) return 'Claimed amount';
  if (isZero(output1Amount) || isZero(output2Amount)) return 'Claimed amount';

  return 'Claimed amounts';
};

export const SwapClaimViewComponent = ({ value }: { value: SwapClaimView }) => {
  if (value.swapClaimView.case === 'visible') {
    const swapTxId = value.swapClaimView.value.swapTx;
    const output1Value = getOutput1ValueOptional(value);
    const output2Value = getOutput2ValueOptional(value);
    const output1Amount = getAmount.optional()(output1Value);
    const output2Amount = getAmount.optional()(output2Value);
    const claimLabel = getClaimLabel(output1Amount, output2Amount);

    return (
      <ViewBox
        label='Swap Claim'
        visibleContent={
          <ActionDetails>
            <ActionDetails.Row label={claimLabel}>
              <div className='flex gap-2'>
                {output1Amount && !isZero(output1Amount) && (
                  <ValueViewComponent view={output1Value} />
                )}
                {output2Amount && !isZero(output2Amount) && (
                  <ValueViewComponent view={output2Value} />
                )}
              </div>
            </ActionDetails.Row>

            {swapTxId && (
              <ActionDetails.Row label='Swap transaction'>
                <TransactionIdComponent transactionId={swapTxId} />
              </ActionDetails.Row>
            )}
          </ActionDetails>
        }
      />
    );
  }

  if (value.swapClaimView.case === 'opaque') {
    return <UnimplementedView label='Swap Claim' />;
  }

  return <div>Invalid SpendView</div>;
};
