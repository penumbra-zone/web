import { LoaderFunction } from 'react-router-dom';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';
import { getEphemeralAddress } from '../../fetchers/address';
import { toPlainMessage } from '@bufbuild/protobuf';

export interface IbcLoaderResponse {
  defaultChainName: string;
}

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const loadBalances = getBalances().then(balances => balances.map(toPlainMessage));
  const loadAddressAccount0 = getEphemeralAddress().then(toPlainMessage);

  const availableBalances = await loadBalances;
  const address = await loadAddressAccount0;

  useStore.setState(state => {
    state.ibcOut.account = 0;
    state.ibcOut.availableBalances = availableBalances;
    state.ibcOut.source.address = address;
  });

  return {
    defaultChainName: testnetIbcChains[0]!.chainName,
  };
};
