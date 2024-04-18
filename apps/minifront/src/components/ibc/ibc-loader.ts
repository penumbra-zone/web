import { LoaderFunction } from 'react-router-dom';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { filterBalancesPerChain } from '../../state/ibc';
import { Chain } from '@penumbra-labs/registry';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  getAssetsFromRegistry,
  getIbcConnections,
  getStakingTokenMetadata,
} from '../../fetchers/registry';

export interface IbcLoaderResponse {
  balances: BalancesResponse[];
  chains: Chain[];
  stakingTokenMetadata: Metadata;
  registryAssets: Metadata[];
}

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const assetBalances = await getBalances();
  const ibcConnections = await getIbcConnections();
  const stakingTokenMetadata = await getStakingTokenMetadata();
  const registryAssets = await getAssetsFromRegistry();

  if (assetBalances[0]) {
    const initialChain = ibcConnections[0];
    const initialSelection = filterBalancesPerChain(
      assetBalances,
      initialChain,
      stakingTokenMetadata,
      registryAssets,
    )[0];

    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = initialSelection;
      state.ibc.chain = initialChain;
    });
  }

  return { balances: assetBalances, chains: ibcConnections, stakingTokenMetadata, registryAssets };
};
