import { JsonViewer } from '@textea/json-viewer';
import { MetadataFetchFn, TransactionViewComponent } from './tx-view-component';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { useEffect, useState } from 'react';
import { SegmentedPicker } from './tx-view-component/segmented-picker';
import { asPublicTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { typeRegistry } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import Link from 'next/link';
import fetchReceiverView from './tx-view-component/tx-details';
import { observer } from 'mobx-react-lite';
import { connectionStore } from '@/shared/model/connection';
import { envQueryFn } from '@/shared/api/env/env';

export enum TxDetailsTab {
  PUBLIC = 'public',
  RECEIVER = 'receiver',
  PRIVATE = 'private',
}

const OPTIONS = [
  { label: 'Your View', value: TxDetailsTab.PRIVATE },
  { label: 'Receiver View', value: TxDetailsTab.RECEIVER },
  { label: 'Public View', value: TxDetailsTab.PUBLIC },
];

const getMetadata: MetadataFetchFn = async ({ assetId }) => {
  const env = await envQueryFn();
  const chainId = env.PENUMBRA_CHAIN_ID;

  const registryClient = new ChainRegistryClient();
  const feeAssetId = assetId ? assetId : registryClient.bundled.globals().stakingAssetId;

  const registry = await registryClient.remote.get(chainId);
  const denomMetadata = registry.getMetadata(feeAssetId);

  return denomMetadata;
};

export const TxViewer = observer(({ txInfo }: { txInfo?: TransactionInfo }) => {
  const { connected } = connectionStore;
  const [option, setOption] = useState(connected ? TxDetailsTab.PRIVATE : TxDetailsTab.PUBLIC);

  useEffect(() => {
    setOption(connected ? TxDetailsTab.PRIVATE : TxDetailsTab.PUBLIC);
  }, [connected]);

  // classify the transaction type
  const transactionClassification = classifyTransaction(txInfo?.view);

  // filter for receiver view
  const showReceiverTransactionView = transactionClassification === 'send';
  const filteredOptions = showReceiverTransactionView
    ? OPTIONS
    : OPTIONS.filter(option => option.value !== TxDetailsTab.RECEIVER);

  // use React-Query to invoke custom hooks that call async translators.
  const { data: receiverView } = useQuery({
    queryKey: ['receiverView', txInfo?.toJson({ typeRegistry }), option],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
    queryFn: () => fetchReceiverView(txInfo!),
    enabled: option === TxDetailsTab.RECEIVER && !!txInfo,
  });

  return (
    <div>
      <div className='text-xl font-bold'>Transaction View</div>
      <div className={'mb-8 flex items-center justify-between'}>
        <div className=' break-all font-mono italic text-muted-foreground'>
          {txInfo?.id && uint8ArrayToHex(txInfo.id.inner)}
        </div>
        <Link
          className={'rounded-lg border bg-black px-3 py-2 font-mono italic text-muted-foreground'}
          href={`/inspect/block/${txInfo?.height.toString()}`}
        >
          block {txInfo?.height.toString()}
        </Link>
      </div>

      {connected && (
        <div className='mx-auto mb-4 max-w-[70%]'>
          <SegmentedPicker
            options={filteredOptions}
            value={option}
            onChange={setOption}
            grow
            size='lg'
          />
        </div>
      )}
      {option === TxDetailsTab.PRIVATE && txInfo && (
        <>
          <TransactionViewComponent
            txv={
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- txInfo.view is guaranteed to be populated
              txInfo.view!
            }
            metadataFetcher={getMetadata}
          />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonViewer
              value={txInfo.toJson({ typeRegistry }) as Jsonified<TransactionInfo>}
              enableClipboard
              defaultInspectDepth={1}
              displayDataTypes={false}
              theme='dark'
              rootName={false}
              quotesOnKeys={false}
            />
          </div>
        </>
      )}
      {option === TxDetailsTab.RECEIVER && receiverView && showReceiverTransactionView && (
        <TransactionViewComponent txv={receiverView} metadataFetcher={getMetadata} />
      )}
      {option === TxDetailsTab.PUBLIC && txInfo && (
        <>
          <TransactionViewComponent
            txv={asPublicTransactionView(txInfo.view)}
            metadataFetcher={getMetadata}
          />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonViewer
              value={txInfo.toJson({ typeRegistry }) as Jsonified<TransactionInfo>}
              enableClipboard
              defaultInspectDepth={1}
              displayDataTypes={false}
              theme='dark'
              rootName={false}
              quotesOnKeys={false}
            />
          </div>
        </>
      )}
    </div>
  );
});
