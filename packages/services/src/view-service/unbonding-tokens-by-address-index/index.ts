import {
  BalancesRequest,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '..';
import { balances } from '../balances';
import { getIsClaimable, isUnbondingTokenBalance } from './helpers';

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] =
  async function* (req, ctx) {
    for await (const balancesResponse of balances(
      new BalancesRequest({ accountFilter: req.addressIndex }),
      ctx,
    )) {
      if (!isUnbondingTokenBalance(balancesResponse)) continue;
      const claimable = await getIsClaimable(balancesResponse, ctx);

      // See https://github.com/typescript-eslint/typescript-eslint/issues/7114
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (req.filter === UnbondingTokensByAddressIndexRequest_Filter.CLAIMABLE && !claimable) {
        continue;
      }

      if (
        // See https://github.com/typescript-eslint/typescript-eslint/issues/7114
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        req.filter === UnbondingTokensByAddressIndexRequest_Filter.NOT_YET_CLAIMABLE &&
        claimable
      ) {
        continue;
      }

      yield new UnbondingTokensByAddressIndexResponse({
        claimable,
        valueView: balancesResponse.balanceView,
      });
    }
  };
