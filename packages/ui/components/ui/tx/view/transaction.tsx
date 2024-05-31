import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';

export const TransactionViewComponent = ({ txv }: { txv: TransactionView }) => {
  if (!txv.bodyView) throw new Error('transaction view missing body view');
  if (!txv.bodyView.transactionParameters?.fee?.amount) throw new Error('Missing fee amount');

  const fee = joinLoHiAmount(txv.bodyView.transactionParameters.fee.amount).toString();

  return (
    <div className='flex flex-col gap-8'>
      {txv.bodyView.memoView?.memoView && <MemoViewComponent memo={txv.bodyView.memoView} />}
      <ViewSection heading='Actions'>
        {txv.bodyView.actionViews.map((av, i) => (
          <ActionViewComponent av={av} key={i} />
        ))}
      </ViewSection>
      <ViewSection heading='Parameters'>
        <ViewBox
          label='Transaction Fee'
          visibleContent={<div className='font-mono'>{fee} upenumbra</div>}
        />
        <ViewBox
          label='Chain ID'
          visibleContent={
            <div className='font-mono'>{txv.bodyView.transactionParameters.chainId}</div>
          }
        />
      </ViewSection>
    </div>
  );
};
