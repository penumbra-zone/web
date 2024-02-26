import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { stakingClient } from '../clients/grpc';
import { AssetBalance, getAssetBalances } from './balances';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { getDisplayDenomFromView } from '@penumbra-zone/types';
import { STAKING_TOKEN, assetPatterns, localAssets } from '@penumbra-zone/constants';
import { Any } from '@bufbuild/protobuf';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';

/**
 * @todo: Make `showInactive` configurable via UI filters.
 */
export const getValidatorInfos = () => stakingClient.validatorInfo({ showInactive: false });

const isDelegationBalance = (assetBalance: AssetBalance) =>
  assetPatterns.delegationToken.test(getDisplayDenomFromView(assetBalance.value));

/**
 * Given an `AddressIndex`, yields `ValueView`s of the given address's balance
 * of delegation tokens. Each `ValueView` has an `extendedMetadata` property
 * containing the `ValidatorInfo` for the validator the delegation token is
 * staked in.
 *
 * Note that one `ValueView` will be returned for each validator, even if the
 * given address holds no tokens for that validator. (When there are no tokens
 * for a given validators, the `ValueView` will have an amount of zero.) This
 * ensures that you can display all validators by iterating over the response
 * from this method, rather than having to call one method to get validators the
 * user has stake in, and another for validators the user doesn't have stake in.
 *
 * @todo: Make this an RPC method, rather than doing it in the webapp.
 * @todo: Make `showInactive` configurable via UI filters.
 */
export const getDelegationsForAccount = async function* (addressIndex: AddressIndex) {
  const assetBalances = await getAssetBalances({ accountFilter: addressIndex });
  const validatorInfoResponses = stakingClient.validatorInfo({ showInactive: false });

  for await (const validatorInfoResponse of validatorInfoResponses) {
    const extendedMetadata = new Any({
      typeUrl: ValidatorInfo.typeName,
      value: validatorInfoResponse.validatorInfo?.toBinary(),
    });

    const delegation = assetBalances.find(isDelegationBalance);

    if (delegation) {
      const withValidatorInfo = delegation.value.clone();

      if (withValidatorInfo.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield withValidatorInfo;
    } else {
      yield new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: {
              hi: 0n,
              lo: 0n,
            },
            metadata: localAssets.find(metadata => metadata.display === STAKING_TOKEN),
            extendedMetadata,
          },
        },
      });
    }
  }
};
