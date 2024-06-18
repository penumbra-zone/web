import { JsonViewer } from '@repo/ui/components/ui/json-viewer';
import { TransactionViewComponent } from '@repo/ui/components/ui/tx/view/transaction';
import { TxDetailsLoaderResult } from '.';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { useState } from 'react';
import { SegmentedPicker } from '@repo/ui/components/ui/segmented-picker';
import { asPublicTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { typeRegistry } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import fetchReceiverView from './hooks';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';

export enum TxDetailsTab {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RECIEVER = 'reciever',
}

const OPTIONS = [
  { label: 'Your View', value: TxDetailsTab.PRIVATE },
  { label: 'Public View', value: TxDetailsTab.PUBLIC },
  { label: 'Reciever View', value: TxDetailsTab.RECIEVER },
];

export const TxViewer = ({ txInfo, hash }: TxDetailsLoaderResult) => {
  const [option, setOption] = useState(TxDetailsTab.PRIVATE);

  // classify the transaction type
  const transactionClassification = classifyTransaction(txInfo.view);

  // filter for reciever view
  const showReceiverTransactionView = transactionClassification === 'send';
  const filteredOptions = showReceiverTransactionView
    ? OPTIONS
    : OPTIONS.filter(option => option.value !== TxDetailsTab.RECIEVER);

  // use React-Query to invoke custom hooks that call async translators.
  const { data: receiverView } = useQuery(
    ['receiverView', txInfo, option],
    () => fetchReceiverView(txInfo),
    {
      enabled: option === TxDetailsTab.RECIEVER && !!txInfo,
    },
  );

  return (
    <div>
      <div className='text-xl font-bold'>Transaction View</div>
      <div className='mb-8 break-all font-mono italic text-muted-foreground'>{hash}</div>

      <div className='mx-auto mb-4 max-w-[70%]'>
        <SegmentedPicker
          options={filteredOptions}
          value={option}
          onChange={setOption}
          grow
          size='lg'
        />
      </div>
      {option === TxDetailsTab.PRIVATE && (
        <>
          <TransactionViewComponent txv={txInfo.view!} />
          <div className='mt-8'>
            <div className='text-xl font-bold'>Raw JSON</div>
            <JsonViewer jsonObj={txInfo.toJson({ typeRegistry }) as Jsonified<TransactionInfo>} />
          </div>
        </>
      )}
      {option === TxDetailsTab.RECIEVER && receiverView && showReceiverTransactionView && (
        <TransactionViewComponent txv={receiverView} />
      )}
      {option === TxDetailsTab.PUBLIC && (
        <TransactionViewComponent txv={asPublicTransactionView(txInfo.view)} />
      )}
    </div>
  );
};
