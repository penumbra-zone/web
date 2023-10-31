import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import { fromBaseUnitAmount } from '@penumbra-zone/types';

export const TransactionViewComponent = ({ txv }: { txv: TransactionView }) => {
  if (!txv.bodyView) throw new Error('transaction view missing body view');
  if (!txv.bodyView.memoView) throw new Error('body view missing memo view');

  return (
    <div className='flex flex-col gap-8'>
      <MemoViewComponent memo={txv.bodyView.memoView} />
      <ViewSection heading='Actions'>
        {txv.bodyView.actionViews.map((av, i) => (
          <ActionViewComponent av={av} key={i} />
        ))}
      </ViewSection>
      <ViewSection heading='Parameters'>
        <ViewBox
          label='Fee'
          visibleContent={
            <div className='font-mono'>
              {/*TODO: fix. (1) why isn't fee in txparams? (2) why isn't there a ValueView in the txv?*/}
              {fromBaseUnitAmount(txv.bodyView.fee!.amount!, 1).toFormat()} upenumbra
            </div>
          }
        />
        <ViewBox
          label='Chain ID'
          visibleContent={
            <div className='font-mono'>{txv.bodyView.transactionParameters?.chainId}</div>
          }
        />
      </ViewSection>
    </div>
  );
};
