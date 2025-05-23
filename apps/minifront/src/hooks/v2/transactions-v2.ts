import { useEffect, useState, useMemo } from 'react';

import { ViewService } from '@penumbra-zone/protobuf';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Metadata, AssetId, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

import { useBalancesResponses } from '../../state/shared';
import { penumbra } from '../../penumbra';

// Helper to compare Uint8Arrays (similar to AllTransactionsPage.tsx)
export const compareUint8Arrays = (a: Uint8Array, b: Uint8Array): boolean => {
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

export interface MinifrontTransactionsListResult {
  data: TransactionInfo[];
  walletAddressViews: AddressView[];
  getTxMetadata: (assetIdOrDenom: AssetId | Denom | string | undefined) => Metadata | undefined;
  isLoading: boolean;
  error: Error | null;
}

export const useMinifrontTransactionsList = (): MinifrontTransactionsListResult => {
  const [txListData, setTxListData] = useState<TransactionInfo[]>([]);
  const [txListIsLoading, setTxListIsLoading] = useState<boolean>(true);
  const [txListError, setTxListError] = useState<Error | null>(null);

  const {
    data: balancesResponses,
    loading: balancesIsLoading,
    error: rawBalancesError,
  } = useBalancesResponses();

  // Derive walletAddressViews from balancesResponses (logic from AllTransactionsPage.tsx)
  const walletAddressViews = useMemo(() => {
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
            : uint8ArrayToHex(accountAddress.addressView.value?.address?.inner ?? new Uint8Array()); // Fallback key
        if (!addressMap.has(key)) {
          addressMap.set(key, accountAddress);
        }
      }
    }
    return Array.from(addressMap.values());
  }, [balancesResponses]);

  // Define getTxMetadata using balancesResponses (logic from AllTransactionsPage.tsx)
  const getTxMetadata = (
    assetIdOrDenom: AssetId | Denom | string | undefined,
  ): Metadata | undefined => {
    if (!assetIdOrDenom || !balancesResponses) {
      return undefined;
    }

    if (assetIdOrDenom instanceof AssetId && assetIdOrDenom.inner) {
      for (const res of balancesResponses) {
        const metadata = getMetadataFromBalancesResponse.optional(res);
        if (
          metadata &&
          metadata.penumbraAssetId?.inner &&
          compareUint8Arrays(metadata.penumbraAssetId.inner, assetIdOrDenom.inner)
        ) {
          return metadata;
        }
      }
    }

    let denomToFind: string | undefined;
    if (typeof assetIdOrDenom === 'string') {
      denomToFind = assetIdOrDenom;
    } else if (assetIdOrDenom instanceof Denom) {
      denomToFind = assetIdOrDenom.denom;
    }

    for (const res of balancesResponses) {
      const metadata = getMetadataFromBalancesResponse.optional(res);
      if (
        metadata &&
        denomToFind &&
        (metadata.base === denomToFind ||
          metadata.display === denomToFind ||
          metadata.symbol === denomToFind ||
          metadata.denomUnits?.some(du => du.denom === denomToFind))
      ) {
        return metadata;
      }
    }
    return undefined;
  };

  useEffect(() => {
    const fetchData = async () => {
      setTxListIsLoading(true);
      setTxListError(null);
      try {
        const viewClient = penumbra.service(ViewService);
        const txInfoStream = viewClient.transactionInfo({});
        const txInfos: TransactionInfo[] = [];
        for await (const txInfoResponse of txInfoStream) {
          if (txInfoResponse.txInfo) {
            txInfos.push(txInfoResponse.txInfo);
          }
        }
        txInfos.sort((a, b) => Number(b.height) - Number(a.height));
        setTxListData(txInfos);
      } catch (e) {
        setTxListError(e instanceof Error ? e : new Error('Failed to fetch transaction list data'));
      } finally {
        setTxListIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  let processedBalancesError: Error | null = null;
  if (rawBalancesError instanceof Error) {
    processedBalancesError = rawBalancesError;
  } else if (rawBalancesError) {
    processedBalancesError = new Error(String(rawBalancesError));
  }

  const isLoading = txListIsLoading || balancesIsLoading;
  const error = txListError ?? processedBalancesError;

  return { data: txListData, walletAddressViews, getTxMetadata, isLoading, error };
};
