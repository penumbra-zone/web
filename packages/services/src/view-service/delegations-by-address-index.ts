import {
  AddressIndex,
  IdentityKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { customizeSymbol } from '@penumbra-zone/wasm/metadata';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
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

  const tracker = await DelegationTokenTracker.init({ addressIndex, ctx });

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

    const delegation = tracker.getDelegationFor(identityKey);

    if (delegation) {
      const withValidatorInfo = delegation.clone();

      if (withValidatorInfo.valueView.case !== 'knownAssetId') {
        throw new Error(`Unexpected ValueView case: ${withValidatorInfo.valueView.case}`);
      }

      withValidatorInfo.valueView.value.extendedMetadata = extendedMetadata;

      yield new DelegationsByAddressIndexResponse({ valueView: withValidatorInfo });
      tracker.markAsQueried(identityKey);
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
  const allUnqueried = tracker.allUnqueried();
  for (const valueView of allUnqueried) {
    yield new DelegationsByAddressIndexResponse({ valueView });
  }
};

interface DelTokenQueryStatus {
  balance: BalancesResponse;
  queried: boolean;
}

class DelegationTokenTracker {
  private constructor(private readonly delTokens: DelTokenQueryStatus[]) {}

  // Create a new Key instance from a password. Do not store the Key, only KeyPrint.
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

    const allDelTokens = allBalances
      .map(b => new BalancesResponse(b))
      .filter(({ balanceView }) => this.isDelegationToken(balanceView))
      .map(balance => {
        return {
          balance,
          queried: false,
        };
      });
    return new this(allDelTokens);
  }

  private static isDelegationToken(view?: ValueView): boolean {
    const match = assetPatterns.delegationToken.capture(getDisplayDenomFromView(view));
    return Boolean(match);
  }

  private findDelegation(idKey: IdentityKey): DelTokenQueryStatus | undefined {
    for (const t of this.delTokens) {
      const match = assetPatterns.delegationToken.capture(
        getDisplayDenomFromView(t.balance.balanceView),
      );
      if (!match || bech32mIdentityKey(idKey) === match.idKey) {
        continue;
      }

      return t;
    }
    return undefined;
  }

  getDelegationFor(idKey: IdentityKey): ValueView | undefined {
    const delegation = this.findDelegation(idKey);
    if (delegation) {
      return delegation.balance.balanceView;
    }
    return undefined;
  }

  markAsQueried(idKey: IdentityKey): void {
    const delegation = this.findDelegation(idKey);
    if (!delegation) {
      console.warn(
        'tried to mark a delegation token as queried the user did not have a balance for',
      );
    } else {
      delegation.queried = true;
    }
  }

  allUnqueried(): ValueView[] {
    return this.delTokens
      .filter(t => !t.queried)
      .map(t => t.balance.balanceView)
      .filter(Boolean) as ValueView[];
  }
}
