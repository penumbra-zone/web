import { TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { MemoViewComponent } from './memo-view';
import { ActionViewComponent } from './action-view';
import { ViewBox, ViewSection } from './viewbox';
import {
  AssetId,
  Metadata,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    const chainId = txv.bodyView?.transactionParameters?.chainId;
    const assetId = txv.bodyView?.transactionParameters?.fee?.assetId;
    setIsLoading(true);
    void getMetadata({ chainId, assetId })
      .then(metadata => {
        if (metadata) {
          const feeValueView = new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: { amount, metadata },
            },
          });
          setFeeValueView(feeValueView);
        }
        setIsLoading(false);
      })
      .catch((e: unknown) => setError(e));
  }, [txv, getMetadata, setFeeValueView, amount]);

  return { feeValueView, isLoading, error };
};

export const TransactionViewComponent = ({
  txv,
  metadataFetcher,
}: {
  txv: TransactionView;
  metadataFetcher: MetadataFetchFn;
}) => {
  const { feeValueView, isLoading, error } = useFeeMetadata(txv, metadataFetcher);

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
            <div className='flex items-center gap-2'>
              {<ValueViewComponent valueView={feeValueView} />}
              {isLoading && <span className='font-mono text-light-brown'>Loading...</span>}
              {error ? (
                <span className='font-mono text-red-400'>Error: {String(error)}</span>
              ) : null}
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
