import { Fragment, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { JsonViewer } from '@textea/json-viewer';
import { asPublicTransactionView } from '@penumbra-zone/perspective/translators/transaction-view';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { Jsonified } from '@penumbra-zone/types/jsonified';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { typeRegistry } from '@penumbra-zone/protobuf';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { SegmentedControl } from '@penumbra-zone/ui/SegmentedControl';
import { AddressViewComponent } from '@penumbra-zone/ui/AddressView';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ActionView } from '@penumbra-zone/ui/ActionView';
import { connectionStore } from '@/shared/model/connection';
import { shorten } from '@penumbra-zone/types/string';
import { useReceiverView } from '../api/use-receiver-view';
import { useFee } from '../api/use-fee';
import { InfoRow } from './info-row';

export enum TxDetailsTab {
  PUBLIC = 'public',
  RECEIVER = 'receiver',
  PRIVATE = 'private',
}

const OPTIONS = [
  { label: 'My View', value: TxDetailsTab.PRIVATE },
  { label: 'Receiver View', value: TxDetailsTab.RECEIVER },
  { label: 'Public View', value: TxDetailsTab.PUBLIC },
];

export const TxViewer = observer(({ txInfo }: { txInfo?: TransactionInfo }) => {
  const { connected } = connectionStore;

  // classify the transaction type
  const transactionClassification = classifyTransaction(txInfo?.view);
  const txId = txInfo?.id && uint8ArrayToHex(txInfo.id.inner);
  const fee = useFee(txInfo?.view);

  // prepare options for SegmentedControl
  const [option, setOption] = useState(connected ? TxDetailsTab.PRIVATE : TxDetailsTab.PUBLIC);
  const showReceiverTransactionView = transactionClassification.type === 'send';
  const filteredOptions = showReceiverTransactionView
    ? OPTIONS
    : OPTIONS.filter(option => option.value !== TxDetailsTab.RECEIVER);

  useEffect(() => {
    setOption(connected ? TxDetailsTab.PRIVATE : TxDetailsTab.PUBLIC);
  }, [connected]);

  // load receiver view if this tab is available to user
  const { data: receiverView } = useReceiverView(
    connected && showReceiverTransactionView && !!txInfo,
    txInfo,
  );

  const txv = useMemo(() => {
    if (option === TxDetailsTab.RECEIVER) {
      return receiverView;
    }
    if (option === TxDetailsTab.PUBLIC) {
      return asPublicTransactionView(txInfo?.view);
    }
    return txInfo?.view;
  }, [option, receiverView, txInfo?.view]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2 text-text-primary'>
        <Text strong>Transaction View</Text>
        {txId && <Text technical>{txId}</Text>}
      </div>

      {connected && (
        <div className='flex justify-center'>
          <Density sparse>
            <SegmentedControl value={option} onChange={opt => setOption(opt as TxDetailsTab)}>
              {filteredOptions.map(option => (
                <SegmentedControl.Item key={option.value} value={option.value} style='filled'>
                  {option.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl>
          </Density>
        </div>
      )}

      <div className='flex flex-col gap-1 p-3 rounded-sm bg-other-tonalFill5 text-text-secondary'>
        {txId && <InfoRow label='Transaction Hash' info={shorten(txId, 8)} copyText={txId} />}
        {!!txInfo?.height && (
          <InfoRow
            label='Block Height'
            info={
              <Text detailTechnical decoration='underline'>
                <Link href={`/inspect/block/${txInfo.height.toString()}`}>
                  {txInfo.height.toString()}
                </Link>
              </Text>
            }
          />
        )}
      </div>

      {txv?.bodyView?.memoView?.memoView && (
        <div className='flex flex-col gap-2'>
          <Text small color='text.primary'>
            Memo
          </Text>
          <div className='flex flex-col gap-1 p-3 rounded-sm bg-other-tonalFill5 text-text-secondary'>
            {txv.bodyView.memoView.memoView.case === 'visible' &&
            txv.bodyView.memoView.memoView.value.plaintext?.returnAddress ? (
              <InfoRow
                label='Return Address'
                info={
                  <Density slim>
                    <AddressViewComponent
                      addressView={txv.bodyView.memoView.memoView.value.plaintext.returnAddress}
                    />
                  </Density>
                }
              />
            ) : (
              <InfoRow label='Return Address' info='Incognito' />
            )}
            {txv.bodyView.memoView.memoView.case === 'visible' &&
              txv.bodyView.memoView.memoView.value.plaintext?.text && (
                <InfoRow
                  label='Message'
                  info={txv.bodyView.memoView.memoView.value.plaintext.text}
                />
              )}
          </div>
        </div>
      )}

      <div className='flex flex-col gap-2'>
        <Text small color='text.primary'>
          Actions
        </Text>
        <div className='flex flex-col'>
          {txv?.bodyView?.actionViews.map((action, index) => (
            <Fragment key={index}>
              <ActionView action={action} />
              <div className='h-2 w-full px-5'>
                <div className='h-full w-px border-l border-solid border-l-other-tonalStroke' />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        <Text small color='text.primary'>
          Parameters
        </Text>
        <div className='flex flex-col gap-1 p-3 rounded-sm bg-other-tonalFill5 text-text-secondary'>
          <InfoRow
            label='Transaction Fee'
            info={
              <Density slim>
                <ValueViewComponent valueView={fee} />
              </Density>
            }
          />
          {txv?.bodyView?.transactionParameters?.chainId && (
            <InfoRow label='Chain ID' info={txv.bodyView.transactionParameters.chainId} />
          )}
        </div>
      </div>

      {option === TxDetailsTab.PRIVATE && txInfo && (
        <div className='flex flex-col gap-2'>
          <Text small color='text.primary'>
            Raw JSON
          </Text>
          <div>
            <JsonViewer
              value={txInfo.toJson({ typeRegistry }) as Jsonified<TransactionInfo>}
              theme='dark'
              className='p-3'
              style={{ backgroundColor: '#fafafa0d' }}
              enableClipboard
              defaultInspectDepth={0}
              displayDataTypes={false}
              rootName={false}
              quotesOnKeys={false}
            />
          </div>
        </div>
      )}
    </div>
  );
});
