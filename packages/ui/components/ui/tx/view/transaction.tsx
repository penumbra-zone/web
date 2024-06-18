import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import { getStakingTokenMetaData } from './registry';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from './value';

export const TransactionViewComponent = ({ txv }: { txv: TransactionView }) => {
  if (!txv.bodyView) throw new Error('transaction view missing body view');
  if (!txv.bodyView.transactionParameters?.fee?.amount) throw new Error('Missing fee amount');

  // Request the fee 'Metadata' and construct a 'ValueView' object
  const chainId = txv.bodyView.transactionParameters.chainId;
  const assetId = txv.bodyView.transactionParameters.fee.assetId;
  const feeAssetMetadata = getStakingTokenMetaData(chainId, assetId);
  const feeValueView = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: { amount: txv.bodyView.transactionParameters.fee.amount, metadata: feeAssetMetadata },
    },
  });

  return (
    <div className='flex flex-col gap-8'>
      {txv.bodyView.memoView?.memoView && <MemoViewComponent memo={txv.bodyView.memoView} />}
      <ViewSection heading='Actions'>
        {txv.bodyView.actionViews.map((av, i) => (
          <ActionViewComponent av={av} key={i} />
        ))}
      </ViewSection>
      <ViewSection heading='Parameters'>
        <ViewBox label='Fee' visibleContent={<ValueViewComponent view={feeValueView} />} />
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
