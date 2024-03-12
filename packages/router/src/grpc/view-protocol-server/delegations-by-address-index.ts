import { Impl } from '.';

import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32IdentityKey, customizeSymbol } from '@penumbra-zone/types';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import {
  getDisplayDenomFromView,
  getIdentityKeyFromValidatorInfo,
  getValidatorInfo,
} from '@penumbra-zone/getters';
import { DelegationCaptureGroups, assetPatterns } from '@penumbra-zone/constants';
import { Any } from '@bufbuild/protobuf';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  AssetMetadataByIdRequest,
  BalancesRequest,
  BalancesResponse,
  DelegationsByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { stakingClientCtx } from '../../ctx';
import { balances } from './balances';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetMetadataById } from './asset-metadata-by-id';

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

export const delegationsByAddressIndex: Impl['delegationsByAddressIndex'] = async function* (
  req,
  ctx,
) {
  const { addressIndex } = req;
  if (!addressIndex) {
    throw new Error('Missing `addressIndex` in `DelegationsByAddressIndex` request');
  }

  const stakingClient = ctx.values.get(stakingClientCtx);
  if (!stakingClient) throw new Error('Staking context not found');

  const assetBalances = await Array.fromAsync(
    balances(new BalancesRequest({ accountFilter: addressIndex }), ctx),
  );

  for await (const validatorInfoResponse of stakingClient.validatorInfo({ showInactive: false })) {
    const validatorInfo = getValidatorInfo(validatorInfoResponse);
    const extendedMetadata = new Any({
      typeUrl: ValidatorInfo.typeName,
      value: validatorInfo.toBinary(),
    });

    const identityKey = getValidatorInfo.pipe(getIdentityKeyFromValidatorInfo)(
      validatorInfoResponse,
    );
    const delegation = assetBalances.find(balance =>
      isDelegationBalance(new BalancesResponse(balance), identityKey),
    );

    if (delegation?.balanceView instanceof ValueView) {
      const withValidatorInfo = delegation.balanceView.clone();

      if (withValidatorInfo.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield new DelegationsByAddressIndexResponse({ valueView: withValidatorInfo });
    } else {
      const { denomMetadata } = await assetMetadataById(
        new AssetMetadataByIdRequest({
          assetId: { altBaseDenom: getDelegationTokenBaseDenom(validatorInfo) },
        }),
        ctx,
      );

      yield new DelegationsByAddressIndexResponse({
        valueView: {
          valueView: {
            case: 'knownAssetId',
            value: {
              amount: {
                hi: 0n,
                lo: 0n,
              },
              metadata: denomMetadata ? customizeSymbol(new Metadata(denomMetadata)) : undefined,
              extendedMetadata,
            },
          },
        },
      });
    }
  }
};
