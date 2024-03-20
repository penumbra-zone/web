import { LoaderFunction } from 'react-router-dom';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { filterBalancesPerChain } from '../../state/ibc';

export type IbcLoaderResponse = BalancesResponse[];

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const assetBalances = await getBalances();

  if (assetBalances[0]) {
    const initialChain = testnetIbcChains[0];
    const initialSelection = filterBalancesPerChain(assetBalances, initialChain)[0];

    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = initialSelection;
      state.ibc.chain = initialChain;
    });
  }

  return assetBalances;
};
