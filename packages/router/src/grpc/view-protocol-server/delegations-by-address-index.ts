import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { customizeSymbol } from '@penumbra-zone/types/src/customize-symbol';
import { bech32IdentityKey } from '@penumbra-zone/bech32/src/identity-key';
import { assetPatterns, STAKING_TOKEN_METADATA } from '@penumbra-zone/constants/src/assets';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import { getValidatorInfo } from '@penumbra-zone/getters/src/validator-info-response';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/src/validator-info';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import {
  AssetMetadataByIdRequest,
  BalancesRequest,
  BalancesResponse,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { stakingClientCtx } from '../../ctx/staking-client';
import { balances } from './balances';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetMetadataById } from './asset-metadata-by-id';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import { Impl } from '.';

const isDelegationBalance = (balance: BalancesResponse, identityKey: IdentityKey) => {
  const match = assetPatterns.delegationToken.capture(getDisplayDenomFromView(balance.balanceView));
  if (!match) return false;

  return bech32IdentityKey(identityKey) === match.bech32IdentityKey;
};

const getDelegationTokenBaseDenom = (validatorInfo: ValidatorInfo) =>
  `udelegation_${bech32IdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo))}`;

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

  const stakingClient = ctx.values.get(stakingClientCtx);
  if (!stakingClient) throw new Error('Staking context not found');

  const assetBalances = await Array.fromAsync(
    balances(new BalancesRequest({ accountFilter: addressIndex }), ctx),
  );

  // Strangely not recognizing enums are the same type
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const showInactive = req.filter === DelegationsByAddressIndexRequest_Filter.ALL;

  for await (const validatorInfoResponse of stakingClient.validatorInfo({ showInactive })) {
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

    if (addressHasDelegationTokens(delegation)) {
      const withValidatorInfo = delegation.balanceView.clone();

      if (withValidatorInfo.valueView.case !== 'knownAssetId')
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield new DelegationsByAddressIndexResponse({ valueView: withValidatorInfo });
    } else {
      // Strangely not recognizing enums are the same type
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
              equivalentValues: [
                {
                  equivalentAmount: { hi: 0n, lo: 0n },
                  numeraire: STAKING_TOKEN_METADATA,
                },
              ],
            },
          },
        },
      });
    }
  }
};
