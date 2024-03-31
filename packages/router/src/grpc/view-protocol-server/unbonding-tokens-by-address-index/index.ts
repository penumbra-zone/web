import { BalancesRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '..';
import { balances } from '../balances';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { isUnbondingTokenBalance } from './helpers';

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] = async (
  req,
  ctx,
) => {
  const allBalances = await Array.fromAsync(
    balances(new BalancesRequest({ accountFilter: { account: 0 } }), ctx),
  );

  const unbondingTokenBalances = allBalances.filter(isUnbondingTokenBalance);
};
