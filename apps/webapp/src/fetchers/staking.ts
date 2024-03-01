import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { stakingClient, viewClient } from '../clients/grpc';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  bech32IdentityKey,
  customizeSymbol,
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
  getValidatorInfo,
} from '@penumbra-zone/types';
import { DelegationCaptureGroups, assetPatterns } from '@penumbra-zone/constants';
import { Any } from '@bufbuild/protobuf';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getBalances } from './balances';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

const isDelegationBalance = (balance: BalancesResponse, identityKey: IdentityKey) => {
  const match = assetPatterns.delegationToken.exec(getDisplayDenomFromView(balance.balanceView));
  if (!match) return false;

  const matchGroups = match.groups as unknown as DelegationCaptureGroups;

  return bech32IdentityKey(identityKey) === matchGroups.bech32IdentityKey;
};

const getDelegationTokenBaseDenom = (validatorInfo: ValidatorInfo) =>
  `udelegation_${bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo))}`;

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
  const assetBalances = await getBalances({ accountFilter: addressIndex });
  const validatorInfoResponses = stakingClient.validatorInfo({ showInactive: false });

  for await (const validatorInfoResponse of validatorInfoResponses) {
    const validatorInfo = getValidatorInfo(validatorInfoResponse);
    const extendedMetadata = new Any({
      typeUrl: ValidatorInfo.typeName,
      value: validatorInfo.toBinary(),
    });

    const identityKey = getValidatorInfo.pipe(getIdentityKeyFromValidatorInfo)(
      validatorInfoResponse,
    );
    const delegation = assetBalances.find(balance => isDelegationBalance(balance, identityKey));

    if (delegation) {
      const withValidatorInfo = delegation.balanceView?.clone();

      if (withValidatorInfo?.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo?.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield withValidatorInfo;
    } else {
      const { denomMetadata } = await viewClient.assetMetadataById({
        assetId: { altBaseDenom: getDelegationTokenBaseDenom(validatorInfo) },
      });

      yield new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: {
              hi: 0n,
              lo: 0n,
            },
            metadata: denomMetadata ? customizeSymbol(denomMetadata) : undefined,
            extendedMetadata,
          },
        },
      });
    }
  }
};
