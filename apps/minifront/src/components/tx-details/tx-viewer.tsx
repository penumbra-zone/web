import { JsonViewer } from '@penumbra-zone/ui/components/ui/json-viewer';
import { MetadataFetchFn, TransactionViewComponent } from '@penumbra-zone/ui/components/ui/tx';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { useState } from 'react';
import { SegmentedPicker } from '@penumbra-zone/ui/components/ui/segmented-picker';
import { asPublicTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { typeRegistry, ViewService } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import fetchReceiverView from './hooks';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { penumbra } from '../../prax';

export enum TxDetailsTab {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RECEIVER = 'receiver',
}

const OPTIONS = [
  { label: 'Your View', value: TxDetailsTab.PRIVATE },
  { label: 'Public View', value: TxDetailsTab.PUBLIC },
  { label: 'Receiver View', value: TxDetailsTab.RECEIVER },
];

const getMetadata: MetadataFetchFn = async ({ assetId }) => {
  const feeAssetId = assetId ? assetId : new ChainRegistryClient().bundled.globals().stakingAssetId;

  const { denomMetadata } = await penumbra
    .service(ViewService)
    .assetMetadataById({ assetId: feeAssetId });
  return denomMetadata;
};

export const TxViewer = ({ txInfo }: { txInfo?: TransactionInfo }) => {
  const [option, setOption] = useState(TxDetailsTab.PRIVATE);

  // classify the transaction type
  const transactionClassification = classifyTransaction(txInfo?.view);

  // filter for reciever view
  const showReceiverTransactionView = transactionClassification === 'send';
  const filteredOptions = showReceiverTransactionView
    ? OPTIONS
    : OPTIONS.filter(option => option.value !== TxDetailsTab.RECEIVER);

  // use React-Query to invoke custom hooks that call async translators.
  const { data: receiverView } = useQuery(
    ['receiverView', txInfo, option],
    () =>
      fetchReceiverView(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
        txInfo!,
      ),
    {
      enabled: option === TxDetailsTab.RECEIVER && !!txInfo,
    },
  );

  return (
    <div>
      <div className='text-xl font-bold'>Transaction View</div>
      <div className={'mb-8 flex items-center justify-between'}>
        <div className=' break-all font-mono italic text-muted-foreground'>
          {txInfo?.id && uint8ArrayToHex(txInfo.id.inner)}
        </div>
        <div
          className={'rounded-lg border bg-black px-3 py-2 font-mono italic text-muted-foreground'}
        >
          block {txInfo?.height.toString()}
        </div>
      </div>

      <div className='mx-auto mb-4 max-w-[70%]'>
        <SegmentedPicker
          options={filteredOptions}
          value={option}
          onChange={setOption}
          grow
          size='lg'
        />
      </div>
      {option === TxDetailsTab.PRIVATE && txInfo && (
        <>
          <TransactionViewComponent
            txv={
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: justify
              txInfo.view!
            }
            metadataFetcher={getMetadata}
          />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonViewer jsonObj={txInfo.toJson({ typeRegistry }) as Jsonified<TransactionInfo>} />
          </div>
        </>
      )}
      {option === TxDetailsTab.RECEIVER && receiverView && showReceiverTransactionView && (
        <TransactionViewComponent txv={receiverView} metadataFetcher={getMetadata} />
      )}
      {option === TxDetailsTab.PUBLIC && txInfo && (
        <TransactionViewComponent
          txv={asPublicTransactionView(txInfo.view)}
          metadataFetcher={getMetadata}
        />
      )}
    </div>
  );
};
