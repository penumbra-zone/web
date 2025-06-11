import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionView as UiTransactionView } from '@/shared/ui/transaction-view';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { useTransactionsStore } from '@/shared/stores/store-context';
import { penumbraService } from '@/shared/services/penumbra-service';

export interface TransactionViewProps {
  txHash: string;
  getTxMetadata: (assetId: AssetId | Denom | undefined) => Metadata | undefined;
  walletAddressViews?: AddressView[];
  onDeselectTransaction?: () => void;
  // If isControlledAddress logic needs to be in minifront, define its signature here
  // and pass it to UiTransactionView. The UiTransactionView props would need to be updated to accept it.
}

export const TransactionView: React.FC<TransactionViewProps> = observer(
  ({ txHash, getTxMetadata, walletAddressViews = [], onDeselectTransaction }) => {
    const transactionsStore = useTransactionsStore();
    const fullTxInfoData = transactionsStore.getTransactionByHash(txHash);
    const loading = transactionsStore.loading;
    const error = null; // TODO: Add error handling to store
    const [blockTimestamp, setBlockTimestamp] = useState<Date | undefined>();

    // Fetch the block timestamp when we have transaction info with height
    useEffect(() => {
      const fetchTimestamp = async () => {
        if (fullTxInfoData?.height) {
          try {
            const timestamp = await penumbraService.getBlockTimestamp(fullTxInfoData.height);
            setBlockTimestamp(timestamp);
          } catch (err) {
            console.error('Failed to fetch block timestamp:', err);
          }
        }
      };

      void fetchTimestamp();
    }, [fullTxInfoData?.height]);

    return (
      <UiTransactionView
        txHash={txHash}
        fullTxInfoFromMinifront={fullTxInfoData}
        isLoading={loading}
        error={error as Error | undefined | null}
        getTxMetadata={getTxMetadata}
        walletAddressViews={walletAddressViews}
        onDeselectTransaction={onDeselectTransaction}
        blockTimestamp={blockTimestamp}
      />
    );
  },
);
