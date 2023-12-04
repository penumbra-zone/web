import { isPenumbraAddr } from '@penumbra-zone/types';
import { Validation } from '../shared/validation-result';
import { AccountBalance, getBalancesByAccount } from '../../fetchers/balances';
import { useStore } from '../../state';
import { LoaderFunction } from 'react-router-dom';

export const penumbraAddrValidation = (): Validation => {
  return {
    type: 'error',
    issue: 'invalid address',
    checkFn: (addr: string) => Boolean(addr) && !isPenumbraAddr(addr),
  };
};

export const AssetBalanceLoader: LoaderFunction = async (data): Promise<AccountBalance[]> => {
  const balancesByAccount = await getBalancesByAccount();

  if (balancesByAccount[0]) {
    const pathname = new URL(data.request.url).pathname;
    const stateKey = pathname === '/send/ibc' ? 'ibc' : 'send';
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state[stateKey].selection = {
        address: balancesByAccount[0]?.address,
        accountIndex: balancesByAccount[0]?.index,
        asset: balancesByAccount[0]?.balances[0],
      };
    });
  }

  return balancesByAccount;
};
