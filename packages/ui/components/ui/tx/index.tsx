import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import {
  AssetId,
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../value';
import { useEffect, useState } from 'react';

// Likely something that calls the registry or view service for metadata
export type MetadataFetchFn = (arg: {
  chainId?: string;
  assetId?: AssetId;
}) => Promise<Metadata | undefined>;

// Uses supplied metadata fetcher to see if it can augment fee ValueView with metadata
const useFeeMetadata = (txv: TransactionView, getMetadata: MetadataFetchFn) => {
  const amount = txv.bodyView?.transactionParameters?.fee?.amount;
  const [feeValueView, setFeeValueView] = useState<ValueView>(
    new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: { amount },
      },
    }),
  );

  useEffect(() => {
    const chainId = txv.bodyView?.transactionParameters?.chainId;
    const assetId = txv.bodyView?.transactionParameters?.fee?.assetId;
    void getMetadata({ chainId, assetId }).then(metadata => {
      if (metadata) {
        const feeValueView = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: { amount, metadata },
          },
        });
        setFeeValueView(feeValueView);
      }
    });
  }, []); // txv, getMetadata, setFeeValueView

  return feeValueView;
};

export const TransactionViewComponent = ({
  txv,
  metadataFetcher,
}: {
  txv: TransactionView;
  metadataFetcher: MetadataFetchFn;
}) => {
  const feeValueView = useFeeMetadata(txv, metadataFetcher);

  return (
    <div className='flex flex-col gap-8'>
      {txv.bodyView?.memoView?.memoView && <MemoViewComponent memo={txv.bodyView.memoView} />}
      <ViewSection heading='Actions'>
        {txv.bodyView?.actionViews.map((av, i) => (
          <ActionViewComponent av={av} feeValueView={feeValueView} key={i} />
        ))}
      </ViewSection>
      <ViewSection heading='Parameters'>
        <ViewBox
          label='Transaction Fee'
          visibleContent={
            <div className='font-mono'>
              {/* Add loading indicator */}
              <ValueViewComponent view={feeValueView} />
            </div>
          }
        />
        <ViewBox
          label='Chain ID'
          visibleContent={
            <div className='font-mono'>{txv.bodyView?.transactionParameters?.chainId}</div>
          }
        />
      </ViewSection>
    </div>
  );
};
