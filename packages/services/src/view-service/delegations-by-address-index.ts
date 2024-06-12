import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import Array from '@penumbra-zone/polyfills/Array.fromAsync';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  AssetMetadataByIdRequest,
  BalancesRequest,
  BalancesResponse,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { stakeClientCtx } from '../ctx/stake-client';
import { balances } from './balances';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetMetadataById } from './asset-metadata-by-id';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { Impl } from '.';

const isDelegationBalance = (balance: BalancesResponse, identityKey: IdentityKey) => {
  const match = assetPatterns.delegationToken.capture(getDisplayDenomFromView(balance.balanceView));
  if (!match) return false;

  return bech32mIdentityKey(identityKey) === match.idKey;
};

const getDelegationTokenBaseDenom = (validatorInfo: ValidatorInfo) =>
  `udelegation_${bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo))}`;

const addressHasDelegationTokens = (
  delegation?: PartialMessage<BalancesResponse>,
): delegation is PartialMessage<BalancesResponse> & { balanceView: ValueView } =>
  delegation?.balanceView instanceof ValueView;

export const delegationsByAddressIndex: Impl['delegationsByAddressIndex'] = async function* (
  req,
  ctx,
) {
  const { addressIndex } = req;
  if (!addressIndex) {
    throw new Error('Missing `addressIndex` in `DelegationsByAddressIndex` request');
  }

  const stakeClient = ctx.values.get(stakeClientCtx);
  if (!stakeClient) throw new Error('Staking context not found');

  const assetBalances = await Array.fromAsync(
    balances(new BalancesRequest({ accountFilter: addressIndex }), ctx),
  );

  // See https://github.com/typescript-eslint/typescript-eslint/issues/7114
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const showInactive = req.filter === DelegationsByAddressIndexRequest_Filter.ALL;

  for await (const { validatorInfo } of stakeClient.validatorInfo({ showInactive })) {
    if (!validatorInfo)
      throw new Error('Missing `validatorInfo` in `DelegationsByAddressIndex` response');
    const extendedMetadata = Any.pack(validatorInfo);

    const identityKey = getIdentityKeyFromValidatorInfo(validatorInfo);
    const delegation = assetBalances.find(balance =>
      isDelegationBalance(new BalancesResponse(balance), identityKey),
    );

    if (addressHasDelegationTokens(delegation)) {
      const withValidatorInfo = delegation.balanceView.clone();

      if (withValidatorInfo.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield new DelegationsByAddressIndexResponse({ valueView: withValidatorInfo });
    } else {
      // See https://github.com/typescript-eslint/typescript-eslint/issues/7114
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (req.filter === DelegationsByAddressIndexRequest_Filter.ALL_ACTIVE_WITH_NONZERO_BALANCES) {
        continue;
      }

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
