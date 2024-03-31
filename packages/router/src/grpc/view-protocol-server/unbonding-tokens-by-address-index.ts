import {
  BalancesRequest,
  BalancesResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '.';
import { balances } from './balances';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';
import { getDisplayFromBalancesResponse } from '@penumbra-zone/getters/src/balances-response';
import { PartialMessage } from '@bufbuild/protobuf';

const forUnbondingTokens = (balancesResponse: PartialMessage<BalancesResponse>) =>
  assetPatterns.unbondingToken.matches(
    getDisplayFromBalancesResponse(new BalancesResponse(balancesResponse)),
  );

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] = async (
  req,
  ctx,
) => {
  const allBalances = await Array.fromAsync(
    balances(new BalancesRequest({ accountFilter: { account: 0 } }), ctx),
  );

  const unbondingTokenBalances = allBalances.filter(forUnbondingTokens);
};
