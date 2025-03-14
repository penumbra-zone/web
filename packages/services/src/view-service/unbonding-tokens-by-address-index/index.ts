import {
  BalancesRequestSchema,
  BalancesResponseSchema,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { create } from '@bufbuild/protobuf';
import { Impl } from '../index.js';
import { balances } from '../balances.js';
import { getIsClaimable, isUnbondingTokenBalance } from './helpers.js';
import { anyPack } from '@bufbuild/protobuf/wkt';
import { stakeClientCtx } from '../../ctx/stake-client.js';
import { getValidatorInfo } from '@penumbra-zone/getters/get-validator-info-response';
import { assetPatterns } from '@penumbra-zone/types/assets';
import {
  getBalanceView,
  getDisplayFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { ValidatorInfoSchema } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] =
  async function* (req, ctx) {
    const stakeClient = ctx.values.get(stakeClientCtx);
    if (!stakeClient) {
      throw new Error('Staking context not found');
    }
    for await (const balancesResponse of balances(
      create(BalancesRequestSchema, { accountFilter: req.addressIndex }),
      ctx,
    )) {
      if (!isUnbondingTokenBalance(balancesResponse)) {
        continue;
      }
      const claimable = await getIsClaimable(balancesResponse, ctx);

      if (req.filter === UnbondingTokensByAddressIndexRequest_Filter.CLAIMABLE && !claimable) {
        continue;
      }

      if (
        req.filter === UnbondingTokensByAddressIndexRequest_Filter.NOT_YET_CLAIMABLE &&
        claimable
      ) {
        continue;
      }

      const regexResult = assetPatterns.unbondingToken.capture(
        getDisplayFromBalancesResponse.optional(create(BalancesResponseSchema, balancesResponse)) ??
          '',
      );
      if (!regexResult) {
        throw new Error('expected delegation token identity key not present');
      }

      const validatorInfoResponse = await stakeClient.getValidatorInfo({
        identityKey: identityKeyFromBech32m(regexResult.idKey),
      });
      const validatorInfo = getValidatorInfo(validatorInfoResponse);

      const withValidatorInfo = getBalanceView(create(BalancesResponseSchema, balancesResponse));
      if (withValidatorInfo.valueView.case !== 'knownAssetId') {
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);
      }

      withValidatorInfo.valueView.value.extendedMetadata = anyPack(
        ValidatorInfoSchema,
        validatorInfo,
      );

      yield create(UnbondingTokensByAddressIndexResponseSchema, {
        claimable,
        valueView: withValidatorInfo,
      });
    }
  };
