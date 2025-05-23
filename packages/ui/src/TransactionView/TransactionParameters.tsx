import React from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../ValueView'; // Updated path
import { DetailRow } from './DetailRow';
import { SectionComponentProps } from './TransactionView';

export const TransactionParameters: React.FC<SectionComponentProps> = ({
  transactionToDisplay,
  getTxMetadata,
}) => {
  const params = transactionToDisplay?.bodyView?.transactionParameters;
  const fee = params?.fee;
  const chainId = params?.chainId;

  let feeValueView: ValueView | undefined;
  if (fee?.amount && fee.assetId) {
    const metadata = getTxMetadata(fee.assetId);
    if (metadata) {
      feeValueView = new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: { amount: fee.amount, metadata },
        },
      });
    } else {
      feeValueView = new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: { amount: fee.amount, assetId: fee.assetId },
        },
      });
    }
  }

  return (
    <div className='flex flex-col gap-1'>
      {feeValueView && (
        <DetailRow
          label='Transaction Fee'
          value={<ValueViewComponent valueView={feeValueView} showValue showIcon={false} />}
        />
      )}
      {chainId && <DetailRow label='Chain ID' value={chainId} />}
    </div>
  );
};
