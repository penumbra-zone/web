import { LoaderFunction } from 'react-router-dom';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';

export type IbcLoaderResponse = BalancesResponse[];

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const assetBalances = await getBalances();

  if (assetBalances[0]) {
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.ibc.selection = assetBalances[0];
      state.ibc.chain = testnetIbcChains[0];
    });
  }

  return assetBalances;
};
