import { toPlainMessage } from '@bufbuild/protobuf';
import { Chain as PenumbraChain, testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { LoaderFunction } from 'react-router-dom';
import { getEphemeralAddress } from '../../fetchers/address';
import { getBalances } from '../../fetchers/balances';
import { useStore } from '../../state';

export interface IbcLoaderResponse {
  defaultChain: PenumbraChain;
}

export const IbcLoader: LoaderFunction = async (): Promise<IbcLoaderResponse> => {
  const defaultChain = testnetIbcChains[0]!;

  const account = 0;

  const loadAddressAccount0 = getEphemeralAddress(account);
  const loadBalances = getBalances();

  const address = toPlainMessage(await loadAddressAccount0);
  const availableBalances = (await loadBalances).map(toPlainMessage);

  useStore.setState(state => {
    state.ibcIn.account = account;
    state.ibcIn.address = address;

    state.ibcOut.account = account;
    state.ibcOut.source.address = address;
    state.ibcOut.availableBalances = availableBalances;
  });

  return {
    defaultChain,
  };
};
