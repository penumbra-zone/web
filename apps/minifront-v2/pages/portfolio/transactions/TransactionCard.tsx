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

import { useTransactionsStore, useBalancesStore } from '@shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@shared/hooks/use-connection';
import { PagePath } from '@shared/const/page';
import { InfoDialog } from '../assets/InfoDialog';

// Utility function to compare Uint8Arrays
const compareUint8Arrays = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
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
      if (!balancesResponses) {
        return [];
      }

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

      return Array.from(addressMap.values());
    }, [balancesResponses]);

    const getTxMetadata = (assetId?: AssetId | Denom | string): Metadata | undefined => {
      if (!assetId || !balancesResponses) {
        return undefined;
      }
      // Check for AssetId first
      if (assetId instanceof AssetId) {
        for (const res of balancesResponses) {
          const metadata = getMetadataFromBalancesResponse.optional(res);
          if (
            metadata?.penumbraAssetId?.inner &&
            compareUint8Arrays(metadata.penumbraAssetId.inner, assetId.inner)
          ) {
            return metadata;
          }
        }
      } else {
        // Must be Denom or string
        const denomToFind = typeof assetId === 'string' ? assetId : assetId.denom;
        for (const res of balancesResponses) {
          const metadata = getMetadataFromBalancesResponse.optional(res);
          if (metadata) {
            if (
              metadata.base === denomToFind ||
              metadata.display === denomToFind ||
              metadata.symbol === denomToFind
            ) {
              return metadata;
            }
            return metadata;
          }
        }
      }
      return undefined;
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
            <div className='flex flex-col items-center justify-center min-h-[250px] gap-4'>
              <div className='size-8 text-text-secondary'>
                <Wallet2 className='w-full h-full' />
              </div>
              <Text color='text.secondary' small>
                Connect wallet to see your transactions
              </Text>
              <div className='w-fit'>
                <Button 
                  actionType='default' 
                  density='compact'
                  onClick={connectWallet}
                >
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
                    return (
                      <TransactionSummary
                        key={txHash}
                        info={transaction}
                        getMetadata={getTxMetadata}
                        walletAddressViews={walletAddressViews}
                        as='button'
                        onClick={() => navigate(`${PagePath.Transactions}?tx=${txHash}`)}
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
                    );
                  })
                ) : (
                  <div className='flex min-h-[120px] flex-col items-center justify-center p-6 text-center text-muted-foreground'>
                    <p className='text-sm'>You have no transactions yet.</p>
                    <p className='text-xs mt-1'>Send, receive, or trade assets to see your transaction history here.</p>
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
