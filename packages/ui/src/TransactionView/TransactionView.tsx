import React, { useMemo, useState, useEffect } from 'react';
import { X } from 'lucide-react';

import {
  asPublicTransactionView,
  asReceiverTransactionView,
} from '@penumbra-zone/perspective/translators/transaction-view';
import { classifyTransaction } from '@penumbra-zone/perspective/transaction/classify';
import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Address, AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionView as PbTransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionInfo as GrpcTransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { typeRegistry } from '@penumbra-zone/protobuf';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

import { Button } from '../Button';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { Skeleton } from '../Skeleton';
import { Text } from '../Text';
import { TransactionSummary as UiTransactionSummary } from '../TransactionSummary';
import { ActionHistory } from './ActionHistory';
import { RawTransaction } from './RawTransaction';
import { Section } from './Section';
import { TabControl, TxViewTab, TAB_OPTIONS } from './TabControl';
import { TransactionInfo } from './TransactionInfo';
import { TransactionMemo } from './TransactionMemo';
import { TransactionParameters } from './TransactionParameters';

export interface TransactionViewProps {
  txHash?: string;
  fullTxInfoFromMinifront?: GrpcTransactionInfo;
  isLoading: boolean;
  error?: unknown;
  getTxMetadata: (assetId: AssetId | Denom | undefined) => Metadata | undefined;
  walletAddressViews?: AddressView[];
  onDeselectTransaction?: () => void;
}

export interface SectionComponentProps {
  transactionToDisplay?: PbTransactionView;
  fullTxInfo?: GrpcTransactionInfo;
  getTxMetadata: (assetId: AssetId | Denom | undefined) => Metadata | undefined;
  walletAddressViews?: AddressView[];
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  fullTxInfoFromMinifront,
  isLoading,
  error,
  getTxMetadata,
  walletAddressViews = [],
  onDeselectTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<TxViewTab>(TxViewTab.MY_VIEW);
  const [displayedTransactionView, setDisplayedTransactionView] = useState<
    PbTransactionView | undefined
  >(undefined);
  const [isViewLoading, setIsViewLoading] = useState<boolean>(true);

  const transactionType = useMemo(
    () =>
      fullTxInfoFromMinifront?.view
        ? classifyTransaction(fullTxInfoFromMinifront.view).type
        : undefined,
    [fullTxInfoFromMinifront],
  );

  const availableTabs = useMemo(() => {
    if (transactionType === 'send') {
      return TAB_OPTIONS;
    }
    return TAB_OPTIONS.filter(tab => tab.value !== TxViewTab.RECEIVER_VIEW);
  }, [transactionType]);

  useEffect(() => {
    const privateView = fullTxInfoFromMinifront?.view;
    if (!privateView) {
      setDisplayedTransactionView(undefined);
      setIsViewLoading(false);
      return;
    }

    setIsViewLoading(true);
    let viewPromise: Promise<PbTransactionView | undefined> | (PbTransactionView | undefined);

    switch (activeTab) {
      case TxViewTab.MY_VIEW:
        viewPromise = privateView;
        break;
      case TxViewTab.PUBLIC_VIEW:
        try {
          viewPromise = asPublicTransactionView(privateView);
        } catch (e) {
          console.error('Failed to generate public transaction view:', e);
          viewPromise = undefined;
        }
        break;
      case TxViewTab.RECEIVER_VIEW:
        if (transactionType === 'send') {
          const isControlledAddress = (_address: Address): boolean => {
            console.warn(
              'isControlledAddress is not implemented in UI package, defaulting to false. This should be passed from minifront if needed.',
            );
            return false;
          };
          try {
            viewPromise = asReceiverTransactionView(privateView, {
              isControlledAddress: addr => Promise.resolve(isControlledAddress(addr)),
            });
          } catch (e) {
            console.error('Failed to generate receiver transaction view:', e);
            viewPromise = undefined;
          }
        } else {
          viewPromise = privateView;
        }
        break;
      default:
        viewPromise = privateView;
    }

    Promise.resolve(viewPromise)
      .then(setDisplayedTransactionView)
      .catch((err: unknown) => {
        console.error('Error resolving transaction view:', err);
        setDisplayedTransactionView(undefined);
      })
      .finally(() => setIsViewLoading(false));
  }, [activeTab, fullTxInfoFromMinifront, transactionType]);

  if (isLoading) {
    return (
      <div className='p-6'>
        <Skeleton />
      </div>
    );
  }
  if (error || !fullTxInfoFromMinifront?.view) {
    return <div className='p-6 text-red-500'>Transaction not found or error loading.</div>;
  }

  const handleClose = () => {
    if (onDeselectTransaction) {
      onDeselectTransaction();
    }
  };

  const sectionProps: Omit<SectionComponentProps, 'transactionToDisplay'> = {
    fullTxInfo: fullTxInfoFromMinifront,
    getTxMetadata,
    walletAddressViews,
  };

  const getBackgroundClass = (tab: TxViewTab): string => {
    if (tab === TxViewTab.MY_VIEW) {
      return 'bg-gradientAccentRadial';
    }
    if (tab === TxViewTab.PUBLIC_VIEW) {
      return 'bg-gradientUnshieldRadial';
    }
    return 'bg-cardGradient'; // Default for RECEIVER_VIEW or other tabs
  };

  const backgroundClass = getBackgroundClass(activeTab);

  const txHashToDisplay = fullTxInfoFromMinifront.id?.inner
    ? uint8ArrayToHex(fullTxInfoFromMinifront.id.inner)
    : undefined;

  return (
    <div
      className={`flex w-full flex-col gap-4 rounded-xl border border-other-tonalStroke p-6 ${backgroundClass}`}
    >
      <div className='flex items-center justify-between'>
        <Text variant='body'>Transaction View</Text>
        <Button
          onClick={handleClose}
          icon={X}
          iconOnly={true}
          priority='secondary'
          actionType='default'
          density='compact'
        >
          Close transaction view
        </Button>
      </div>
      {txHashToDisplay && (
        <Text variant='technical' color='text.secondary' break='all'>
          {txHashToDisplay}
        </Text>
      )}

      <div className='mb-4'>
        <TabControl
          value={activeTab}
          onChange={val => setActiveTab(val as TxViewTab)}
          options={availableTabs}
        />
      </div>

      {isViewLoading ? (
        <div className='p-6'>
          <Skeleton />
        </div>
      ) : (
        <>
          <Section sectionTitle='Transaction Info'>
            <TransactionInfo {...sectionProps} transactionToDisplay={displayedTransactionView} />
          </Section>
          <Section sectionTitle='Memo'>
            <TransactionMemo {...sectionProps} transactionToDisplay={displayedTransactionView} />
          </Section>
          <Section sectionTitle='Summary' layout='transparent'>
            <UiTransactionSummary
              info={fullTxInfoFromMinifront}
              getMetadata={getTxMetadata}
              walletAddressViews={walletAddressViews}
              hideMemo={true}
            />
          </Section>

          <Section sectionTitle='Actions' layout='transparent'>
            <ActionHistory
              actionViews={displayedTransactionView?.bodyView?.actionViews}
              getTxMetadata={getTxMetadata}
            />
          </Section>

          <Section sectionTitle='Parameters'>
            <TransactionParameters
              {...sectionProps}
              transactionToDisplay={displayedTransactionView}
            />
          </Section>
          <Section
            sectionTitle='Raw JSON'
            titleAdornment={
              displayedTransactionView && (
                <CopyToClipboardButton
                  text={JSON.stringify(displayedTransactionView.toJson({ typeRegistry }), null, 2)}
                  variant='slim'
                />
              )
            }
          >
            <RawTransaction {...sectionProps} transactionToDisplay={displayedTransactionView} />
          </Section>
        </>
      )}
    </div>
  );
};
