import { LoaderFunction } from 'react-router-dom';
import { testnetIbcChains, getChainMetadataByName } from '@penumbra-zone/constants/src/chains';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { getEphemeralAddress } from '../../fetchers/address';
import { getCosmosChainByName } from '@penumbra-zone/constants/src/cosmos';
import { filterBalancesPerChain } from '../../state/filter-balances-per-chain';
import { toPlainMessage } from '@bufbuild/protobuf';

export interface IbcLoaderResponse {
  initialChainName: string;
}

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const assetBalances = await getBalances();
  const initialAddress = await getEphemeralAddress(0);
  const chainName = testnetIbcChains[0]!.chainName;
  const penumbraChain = getChainMetadataByName(chainName)!;
  const cosmosChain = getCosmosChainByName(chainName)!;

  useStore.setState(state => {
    state.ibc.assetBalances = assetBalances.map(toPlainMessage);
    state.ibc.penumbra.address = initialAddress;
    state.ibc.penumbraChain = penumbraChain;
    state.ibc.cosmosChain = cosmosChain;
    state.ibc.penumbra.unshield = filterBalancesPerChain(assetBalances, penumbraChain)[0];
  });

  return {
    initialChainName: chainName,
  };
};
