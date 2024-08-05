import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { assetPatterns, DelegationCaptureGroups } from '@penumbra-zone/types/assets';
import { bech32mIdentityKey, identityKeyFromBech32m } from '@penumbra-zone/bech32m/penumbravalid';
import { Any } from '@bufbuild/protobuf';
import { getValidatorInfo } from '@penumbra-zone/getters/validator-info-response';
import { getIdentityKeyFromValidatorInfo } from '@penumbra-zone/getters/validator-info';
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import {
  AssetMetadataByIdRequest,
  BalancesRequest,
  BalancesResponse,
  DelegationsByAddressIndexRequest_Filter,
  DelegationsByAddressIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { stakeClientCtx } from '../ctx/stake-client.js';
import { balances } from './balances.js';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { assetMetadataById } from './asset-metadata-by-id.js';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { Impl } from './index.js';
import { HandlerContext } from '@connectrpc/connect';

const getDelegationTokenBaseDenom = (validatorInfo: ValidatorInfo) =>
  `udelegation_${bech32mIdentityKey(getIdentityKeyFromValidatorInfo(validatorInfo))}`;

const responseWithExtMetadata = function* (delegation: ValueView, extendedMetadata: Any) {
  const withValidatorInfo = delegation.clone();
  if (withValidatorInfo.valueView.case !== 'knownAssetId') {
    throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);
  }
  withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;
  yield new DelegationsByAddressIndexResponse({ valueView: withValidatorInfo });
};

export const delegationsByAddressIndex: Impl['delegationsByAddressIndex'] = async function* (
  req,
  ctx,
) {
  const { addressIndex } = req;
  if (!addressIndex) {
    throw new Error('Missing `addressIndex` in `DelegationsByAddressIndex` request');
  }

  const stakeClient = ctx.values.get(stakeClientCtx);
  if (!stakeClient) {
    throw new Error('Staking context not found');
  }

  const delTokenTracker = await DelegationTokenTracker.init({ addressIndex, ctx });

  // See https://github.com/typescript-eslint/typescript-eslint/issues/7114
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const showInactive = req.filter === DelegationsByAddressIndexRequest_Filter.ALL;

  // Step 1: Query the current validator list. Mark those that have matched what's in the balances.
  for await (const validatorInfoResponse of stakeClient.validatorInfo({ showInactive })) {
    const validatorInfo = getValidatorInfo(validatorInfoResponse);
    const extendedMetadata = Any.pack(validatorInfo);

    const identityKey = getValidatorInfo.pipe(getIdentityKeyFromValidatorInfo)(
      validatorInfoResponse,
    );

    const delegation = delTokenTracker.getDelegationFor(identityKey);

    if (delegation) {
      yield* responseWithExtMetadata(delegation, extendedMetadata);
      delTokenTracker.markAsQueried(identityKey);
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

  // Step 2: For the delegation tokens that haven't been queried for, it must mean they are jailed.
  //         It's necessary to query for these individually as they are not available in the previous query.
  if (showInactive) {
    const allUnqueried = delTokenTracker.allUnqueried();
    for (const { identityKey, valueView } of allUnqueried) {
      const { validatorInfo } = await stakeClient.getValidatorInfo({ identityKey });
      if (!validatorInfo) {
        console.warn(`No validator info found for ${bech32mIdentityKey(identityKey)}`);
        continue;
      }

      const extendedMetadata = Any.pack(validatorInfo);
      yield* responseWithExtMetadata(valueView, extendedMetadata);
    }
  }
};

type Bech32IdentityKey = string;

interface DelTokenQueryStatus {
  valueView: ValueView;
  queried: boolean;
  identityKey: IdentityKey;
}

type DelTokenMap = Record<Bech32IdentityKey, DelTokenQueryStatus>;

// Class used to keep track of what delegation balances have been queried yet.
// Used after main stream loop to ensure we still query and send back delegation token balances
// that have a jailed state.
class DelegationTokenTracker {
  private constructor(private readonly delTokens: DelTokenMap) {}

  static async init({
    addressIndex,
    ctx,
  }: {
    addressIndex: AddressIndex;
    ctx: HandlerContext;
  }): Promise<DelegationTokenTracker> {
    const allBalances = await Array.fromAsync(
      balances(new BalancesRequest({ accountFilter: addressIndex }), ctx),
    );

    const delTokenMap: DelTokenMap = {};

    for (const partialRes of allBalances) {
      const res = new BalancesResponse(partialRes);
      const match = this.getDelTokenCaptureGroups(res.balanceView);
      if (match && res.balanceView) {
        delTokenMap[match.idKey] = {
          valueView: res.balanceView,
          queried: false,
          identityKey: new IdentityKey(identityKeyFromBech32m(match.idKey)),
        };
      }
    }
    return new this(delTokenMap);
  }

  private static getDelTokenCaptureGroups(view?: ValueView): DelegationCaptureGroups | undefined {
    return assetPatterns.delegationToken.capture(getDisplayDenomFromView(view));
  }

  private findDelegationStatus(idKey: IdentityKey): DelTokenQueryStatus | undefined {
    return this.delTokens[bech32mIdentityKey(idKey)];
  }

  getDelegationFor(idKey: IdentityKey): ValueView | undefined {
    const delegation = this.findDelegationStatus(idKey);
    if (delegation) {
      return delegation.valueView;
    }
    return undefined;
  }

  markAsQueried(idKey: IdentityKey): void {
    const delegation = this.findDelegationStatus(idKey);
    if (!delegation) {
      console.warn(
        'tried to mark a delegation token as queried the user did not have a balance for',
      );
    } else {
      delegation.queried = true;
    }
  }

  allUnqueried(): DelTokenQueryStatus[] {
    return Object.values(this.delTokens).filter(t => !t.queried);
  }
}
