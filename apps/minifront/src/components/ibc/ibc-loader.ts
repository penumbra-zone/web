import { LoaderFunction } from 'react-router-dom';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { filterBalancesPerChain } from '../../state/ibc';
import { getChainId } from '../../fetchers/chain-id';
import { Chain, ChainRegistryClient } from '@penumbra-labs/registry';

export interface IbcLoaderResponse {
  balances: BalancesResponse[];
  chains: Chain[];
}

const getIbcConnections = async () => {
  const chainId = await getChainId();
  if (!chainId) throw new Error('Could not fetch chain id');

  const registryClient = new ChainRegistryClient();
  const { ibcConnections } = await registryClient.get(chainId);
  return ibcConnections;
};

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const assetBalances = await getBalances();
  const ibcConnections = await getIbcConnections();

  if (assetBalances[0]) {
    const initialChain = ibcConnections[0];
    const initialSelection = filterBalancesPerChain(assetBalances, initialChain)[0];

    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = initialSelection;
      state.ibc.chain = initialChain;
    });
  }

  return { balances: assetBalances, chains: ibcConnections };
};
