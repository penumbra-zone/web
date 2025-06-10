import { ReactNode, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { FileSearch, Wallet2 } from 'lucide-react';

import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Card } from '@penumbra-zone/ui/Card';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { TransactionSummary } from '@penumbra-zone/ui/TransactionSummary';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

import { useTransactionsStore, useBalancesStore } from '@/shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@/shared/hooks/use-connection';
import { PagePath } from '@/shared/const/page';
import { InfoDialog } from '../assets/info-dialog';

// Utility function to compare Uint8Arrays
const compareUint8Arrays = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

export interface TransactionCardProps {
  title?: string | null;
  showInfoButton?: boolean;
  showSeeAllLink?: boolean;
  maxItems?: number;
  headerAction?: ReactNode;
}

export const TransactionCard = observer(
  ({
    title = 'Your Recent Transactions',
    showInfoButton = true,
    showSeeAllLink = true,
    maxItems,
    headerAction,
  }: TransactionCardProps) => {
    const transactionsStore = useTransactionsStore();
    const balancesStore = useBalancesStore();
    const navigate = useNavigate();
    const isConnected = useIsConnected();
    const { connectWallet } = useConnectWallet();

    const allTransactions = transactionsStore.sortedTransactions;
    const loadingTransactions = transactionsStore.loading;
    const balancesResponses = balancesStore.balancesResponses;

    const transactionsToDisplay =
      maxItems && allTransactions.length > 0 ? allTransactions.slice(0, maxItems) : allTransactions;

    // Extract wallet address views from balances responses
    const walletAddressViews = useMemo((): AddressView[] => {
      const addressMap = new Map<string | number, AddressView>();

      for (const response of balancesResponses) {
        const accountAddress = response.accountAddress;
        if (accountAddress) {
          const key =
            accountAddress.addressView.case === 'decoded' &&
            accountAddress.addressView.value.index?.account !== undefined
              ? accountAddress.addressView.value.index.account
              : accountAddress.toJsonString();

          addressMap.set(key, accountAddress);
        }
      }

      const addressViews = Array.from(addressMap.values());

      return addressViews;
    }, [balancesResponses]);

    const getTxMetadata = (assetId?: AssetId | Denom | string): Metadata | undefined => {
      if (!assetId) {
        return undefined;
      }
      let rawMetadata: Metadata | undefined;

      // Check for AssetId first
      if (assetId instanceof AssetId) {
        for (const res of balancesResponses) {
          const meta = getMetadataFromBalancesResponse.optional(res);
          if (
            meta?.penumbraAssetId?.inner &&
            compareUint8Arrays(meta.penumbraAssetId.inner, assetId.inner)
          ) {
            rawMetadata = meta;
            break;
          }
        }
      } else {
        // Must be Denom or string
        const denomToFind = typeof assetId === 'string' ? assetId : assetId.denom;
        for (const res of balancesResponses) {
          const meta = getMetadataFromBalancesResponse.optional(res);
          if (meta) {
            if (
              meta.base === denomToFind ||
              meta.display === denomToFind ||
              meta.symbol === denomToFind
            ) {
              rawMetadata = meta;
              break;
            }
          }
        }
      }

      // Return raw metadata without enhancement
      return rawMetadata;
    };

    const infoButton = showInfoButton ? <InfoDialog /> : null;
    const seeAllLink = showSeeAllLink ? (
      <Link to={PagePath.Transactions}>
        <Button actionType='default' density='slim'>
          See All
        </Button>
      </Link>
    ) : null;

    const headerContent =
      infoButton || seeAllLink ? (
        <div className='flex items-center gap-2'>
          {infoButton}
          {seeAllLink}
        </div>
      ) : null;

    const cardTitle = title === null || title === '' ? undefined : title;

    const getTxHash = (tx: TransactionInfo): string => {
      return tx.id?.inner ? uint8ArrayToHex(tx.id.inner) : '';
    };

    const getSkeletonLength = () => {
      if (maxItems) {
        return maxItems;
      }
      if (transactionsToDisplay.length === 0) {
        return 3;
      }
      return transactionsToDisplay.length;
    };

    // If wallet is not connected, show connect wallet message
    if (!isConnected) {
      return (
        <div>
          <Card title={cardTitle} headerAction={headerAction} endContent={headerContent}>
            <div className='flex min-h-[250px] flex-col items-center justify-center gap-4'>
              <div className='size-8 text-text-secondary'>
                <Wallet2 className='size-full' />
              </div>
              <Text color='text.secondary' small>
                Connect wallet to see your transactions
              </Text>
              <div className='w-fit'>
                <Button actionType='default' density='compact' onClick={() => void connectWallet()}>
                  Connect wallet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <Card title={cardTitle} headerAction={headerAction} endContent={headerContent}>
          <div className='flex flex-col gap-1'>
            {loadingTransactions ? (
              Array.from({ length: getSkeletonLength() }).map((_, i) => (
                <div key={i} className='h-16 w-full'>
                  <Skeleton />
                </div>
              ))
            ) : (
              <>
                {transactionsToDisplay.length > 0 ? (
                  transactionsToDisplay.map((transaction: TransactionInfo) => {
                    const txHash = getTxHash(transaction);

                    // For this transaction, combine wallet addresses with transaction-specific addresses
                    const transactionAddressViews = transaction.perspective?.addressViews || [];
                    const combinedWalletAddressViews = [...walletAddressViews];

                    // Add transaction addresses that aren't already in wallet addresses
                    for (const txAddr of transactionAddressViews) {
                      const isDuplicate = combinedWalletAddressViews.some(walletAddr => {
                        // Compare by inner bytes
                        const txInner =
                          txAddr.addressView.case === 'decoded'
                            ? txAddr.addressView.value.address?.inner
                            : txAddr.addressView.case === 'opaque'
                              ? txAddr.addressView.value.address?.inner
                              : null;
                        const walletInner =
                          walletAddr.addressView.case === 'decoded'
                            ? walletAddr.addressView.value.address?.inner
                            : walletAddr.addressView.case === 'opaque'
                              ? walletAddr.addressView.value.address?.inner
                              : null;

                        return (
                          txInner &&
                          walletInner &&
                          txInner.length === walletInner.length &&
                          txInner.every((byte, i) => byte === walletInner[i])
                        );
                      });

                      if (!isDuplicate) {
                        combinedWalletAddressViews.push(txAddr);
                      }
                    }

                    return (
                      <div
                        key={txHash}
                        className='cursor-pointer'
                        onClick={() => navigate(`${PagePath.Transactions}?tx=${txHash}`)}
                      >
                        <div className='[&>div]:hover:bg-gradient-to-b [&>div]:hover:from-[rgba(83,174,168,0.15)] [&>div]:hover:to-[rgba(83,174,168,0.15)] [&>div]:hover:bg-[rgba(250,250,250,0.05)] [&>div]:hover:bg-blend-overlay'>
                          <TransactionSummary
                            info={transaction}
                            getMetadata={getTxMetadata}
                            endAdornment={
                              <Button
                                actionType='accent'
                                density='compact'
                                iconOnly
                                icon={FileSearch}
                              >
                                View Details
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='flex min-h-[120px] flex-col items-center justify-center p-6 text-center text-muted-foreground'>
                    <p className='text-sm'>You have no transactions yet.</p>
                    <p className='mt-1 text-xs'>
                      Send, receive, or trade assets to see your transaction history here.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    );
  },
);
