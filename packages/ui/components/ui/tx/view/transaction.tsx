import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { getStakingTokenMetaData } from './registry';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

export const TransactionViewComponent = ({ txv }: { txv: TransactionView }) => {
  if (!txv.bodyView) throw new Error('transaction view missing body view');
  if (!txv.bodyView.transactionParameters?.fee?.amount) throw new Error('Missing fee amount');

  // Request the asset metadata
  let chain_id = txv.bodyView.transactionParameters.chainId;
  let asset_id = txv.bodyView.transactionParameters.fee.assetId!;
  let exponent = getDisplayDenomExponent(getStakingTokenMetaData(chain_id, asset_id));

  const fee = (
    Number(joinLoHiAmount(txv.bodyView.transactionParameters.fee.amount)) /
    10 ** exponent
  ).toString();

  return (
    <div className='flex flex-col gap-8'>
      {txv.bodyView.memoView?.memoView && <MemoViewComponent memo={txv.bodyView.memoView} />}
      <ViewSection heading='Actions'>
        {txv.bodyView.actionViews.map((av, i) => (
          <ActionViewComponent av={av} key={i} />
        ))}
      </ViewSection>
      <ViewSection heading='Parameters'>
        <ViewBox label='Fee' visibleContent={<div className='font-mono'>{fee} UM</div>} />
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
