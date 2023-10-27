import { useEffect, useState } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { useStore } from '../state';
import { accountSelector } from '../state/account';

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const useBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}) => {
  const { isConnected } = useStore(accountSelector);
  const [balances, setBalances] = useState<AsyncIterable<BalancesResponse> | undefined>();

  useEffect(() => {
    if (!isConnected) return;
    const req = new BalancesRequest();
    if (accountFilter) req.accountFilter = accountFilter;
    if (assetIdFilter) req.assetIdFilter = assetIdFilter;
    setBalances(viewClient.balances(req));
  }, [isConnected, accountFilter, assetIdFilter]);

  return useCollectedStream(balances, isConnected);
};
