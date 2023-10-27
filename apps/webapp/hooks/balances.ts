import { useMemo } from 'react';
import { viewClient } from '../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { BalancesRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { useConnect } from './connect';

interface BalancesProps {
  accountFilter?: AddressIndex;
  assetIdFilter?: AssetId;
}

export const useBalances = ({ accountFilter, assetIdFilter }: BalancesProps = {}) => {
  const { isConnected } = useConnect();
  const balances = useMemo(() => {
    const req = new BalancesRequest();
    if (accountFilter) req.accountFilter = accountFilter;
    if (assetIdFilter) req.assetIdFilter = assetIdFilter;
    return viewClient.balances(req);
  }, [accountFilter, assetIdFilter, isConnected]);

  return useCollectedStream(balances);
};
