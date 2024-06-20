import { LoaderFunction } from 'react-router-dom';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getChains, getStakingTokenMetadata } from '../../fetchers/registry';
import { getAllAssets } from '../../fetchers/assets';
import { filterBalancesPerChain } from '../../state/ibc-out';
import { abortLoader } from '../../abort-loader';

export interface IbcLoaderResponse {
  balances: BalancesResponse[];
  stakingTokenMetadata: Metadata;
  assets: Metadata[];
}

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  await abortLoader();
  const balances = await getBalances();
  const chains = await getChains();
  const stakingTokenMetadata = await getStakingTokenMetadata();
  const assets = await getAllAssets();

  if (balances[0]) {
    const initialChain = chains[0];
    const initialSelection = filterBalancesPerChain(
      balances,
      initialChain,
      assets,
      stakingTokenMetadata,
    )[0];

    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibcOut.selection = initialSelection;
      state.ibcOut.chain = initialChain;
    });
  }

  return { balances, stakingTokenMetadata, assets };
};
