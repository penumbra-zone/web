import React from 'react';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { DetailRow } from './DetailRow';
import { SectionComponentProps } from './TransactionView';
import { Text } from '@penumbra-zone/ui/Text';

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
      <DetailRow
        label='Transaction Fee'
        value={
          feeValueView ? (
            <ValueViewComponent valueView={feeValueView} context='table' abbreviate={false} />
          ) : (
            <Text variant='smallTechnical' color='text.secondary'>
              No fee
            </Text>
          )
        }
      />
      {chainId && <DetailRow label='Chain ID' value={chainId} />}
    </div>
  );
};
