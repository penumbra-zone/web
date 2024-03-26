import { ViewBox } from './viewbox';
import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { JsonViewer } from '../../json-viewer';
import { JsonObject } from '@bufbuild/protobuf';
import { TransactionIdComponent } from './transaction-id';
import { SquareArrowRight } from 'lucide-react';

export const SwapClaimViewComponent = ({ value }: { value: SwapClaimView }) => {
  if (value.swapClaimView.case === 'visible') {
    const swapTxId = value.swapClaimView.value.swapTx;

    return (
      <ViewBox
        label='Swap Claim'
        visibleContent={
          <>
            {swapTxId && (
              <div>
                <TransactionIdComponent
                  prefix={
                    <>
                      Swap
                      <SquareArrowRight size={16} className='ml-1' />
                    </>
                  }
                  transactionId={swapTxId}
                  shaClassName='font-mono ml-1'
                />
              </div>
            )}
            {/** @todo: Make a real UI for swap claims -- web#424 */}
            <JsonViewer jsonObj={value.swapClaimView.value.toJson() as JsonObject} />
          </>
        }
      />
    );
  }

  if (value.swapClaimView.case === 'opaque') {
    return <ViewBox label='Swap Claim' />;
  }

  return <div>Invalid SpendView</div>;
};
