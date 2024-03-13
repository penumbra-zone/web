import { IdentityKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import Array from '@penumbra-zone/polyfills/src/Array.fromAsync';
import { customizeSymbol } from '@penumbra-zone/types/src/customize-symbol';
import { bech32IdentityKey } from '@penumbra-zone/types/src/identity-key';
import { assetPatterns, DelegationCaptureGroups } from '@penumbra-zone/constants/src/assets';
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
import { stakingClientCtx } from '../../ctx';
import { balances } from './balances';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetMetadataById } from './asset-metadata-by-id';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/src/value-view';
import { Impl } from '.';

const isDelegationBalance = (balance: BalancesResponse, identityKey: IdentityKey) => {
  const match = assetPatterns.delegationToken.exec(getDisplayDenomFromView(balance.balanceView));
  if (!match) return false;

  const matchGroups = match.groups as unknown as DelegationCaptureGroups;

  return bech32IdentityKey(identityKey) === matchGroups.bech32IdentityKey;
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

  for await (const validatorInfoResponse of stakingClient.validatorInfo({
    showInactive: req.filter === DelegationsByAddressIndexRequest_Filter.ALL,
  })) {
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
