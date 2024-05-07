import {
  BalancesRequest,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '..';
import { balances } from '../balances';
import { getIsClaimable, isUnbondingTokenBalance } from './helpers';
import {getValidatorInfo} from "@penumbra-zone/getters/validator-info-response";
import {Any} from "@bufbuild/protobuf";
import {ValidatorInfo} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb";
import {stakingClientCtx} from "../../ctx/staking-client";

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] =
  async function* (req, ctx) {
    const stakingClient = ctx.values.get(stakingClientCtx);
    if (!stakingClient) throw new Error('Staking context not found');
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


      const validatorInfo = stakingClient.validatorInfo({ showInactive: true });
      getValidatorInfo(va)
      const extendedMetadata = new Any({
        typeUrl: ValidatorInfo.typeName,
        value: validatorInfo.toBinary(),
      });

      yield new UnbondingTokensByAddressIndexResponse({
        claimable,
        valueView: balancesResponse.balanceView,
      });
    }
  };
