import {
  BalancesRequest,
  BalancesResponse,
  UnbondingTokensByAddressIndexRequest_Filter,
  UnbondingTokensByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '..';
import { balances } from '../balances';
import { getIsClaimable, isUnbondingTokenBalance } from './helpers';
import { Any } from '@bufbuild/protobuf';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { stakeClientCtx } from '../../ctx/stake-client';
import { getValidatorInfo } from '@penumbra-zone/getters/get-validator-info-response';
import { assetPatterns } from '@penumbra-zone/types/assets';
import {
  getBalanceView,
  getDisplayFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';

export const unbondingTokensByAddressIndex: Impl['unbondingTokensByAddressIndex'] =
  async function* (req, ctx) {
    const stakeClient = ctx.values.get(stakeClientCtx);
    if (!stakeClient) throw new Error('Staking context not found');
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

      const regexResult = assetPatterns.unbondingToken.capture(
        getDisplayFromBalancesResponse(new BalancesResponse(balancesResponse)) ?? '',
      );
      if (!regexResult) throw new Error('expected delegation token identity key not present');

      const validatorInfoResponse = await stakeClient.getValidatorInfo({
        identityKey: identityKeyFromBech32m(regexResult.idKey),
      });
      const validatorInfo = getValidatorInfo(validatorInfoResponse);
      const extendedMetadata = new Any({
        typeUrl: ValidatorInfo.typeName,
        value: validatorInfo.toBinary(),
      });

      const withValidatorInfo = getBalanceView(new BalancesResponse(balancesResponse));
      if (withValidatorInfo.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield new UnbondingTokensByAddressIndexResponse({
        claimable,
        valueView: withValidatorInfo,
      });
    }
  };
