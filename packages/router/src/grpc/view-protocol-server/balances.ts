import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

import { addLoHi, Base64Str, uint8ArrayToBase64 } from '@penumbra-zone/types';
import { getAmount, getAssetIdFromRecord } from '@penumbra-zone/getters';

import {
  AssetId,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  AddressIndex,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  AddressByIndexRequest,
  AssetMetadataByIdRequest,
  BalancesRequest,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext } from '@connectrpc/connect';
import { assetMetadataById } from './asset-metadata-by-id';
import { addressByIndex } from './address-by-index';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

// Handles aggregating amounts and filtering by account number/asset id
export const balances: Impl['balances'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  const aggregator = new BalancesAggregator(ctx);

  for await (const noteRecord of indexedDb.iterateSpendableNotes()) {
    if (noteRecord.heightSpent !== 0n) continue;
    await aggregator.add(noteRecord);
  }

  yield* aggregator.filteredResponses(req);
};

/**
 * account number -> aggregated assets map
 * {
 *   0: {
 *     "6KBVsPINa8gWSHhfH+kAFJC4afEJA3EtuB2HyCqJUws=": BalancesResponse
 *     "CwpUYIdQ9H5Dnf3oQ1l7ISeVMVahWbVNNvMA0dBSdwI": BalancesResponse
 *   }
 *   12: {
 *   "nDjzm+ldIrNMJha1anGMDVxpA5cLCPnUYQ1clmHF1gw=": BalancesResponse
 *   }
 * }
 */
type BalancesMap = Record<Base64Str, BalancesResponse>;
type AccountMap = Record<AddressIndex['account'], BalancesMap>;

class BalancesAggregator {
  readonly accounts: AccountMap = {};

  constructor(readonly ctx: HandlerContext) {}

  async add(n: SpendableNoteRecord) {
    const accountNumber = n.addressIndex?.account ?? 0;

    // Initialize account obj if not present
    if (!this.accounts[accountNumber]) {
      this.accounts[accountNumber] = {};
    }

    const assetId = getAssetIdFromRecord(n);
    const assetIdBase64 = uint8ArrayToBase64(assetId.inner);

    // If asset not present in map, initialize it with its metadata
    if (!this.accounts[accountNumber]![assetIdBase64]) {
      this.accounts[accountNumber]![assetIdBase64] = await this.initializeBalResponse(n);
    }

    // Many type overrides, but initialization above guarantees presence
    const valueView = this.accounts[accountNumber]![assetIdBase64]!.balanceView;
    const currentAmount = getAmount(valueView);
    this.aggregateAmount(currentAmount, n);
  }

  filteredResponses({ assetIdFilter, accountFilter }: BalancesRequest) {
    return Object.entries(this.accounts)
      .filter(
        ([accountNumber]) =>
          !accountFilter || // No account filter requested
          Number(accountNumber) === accountFilter.account, // Address indexes match
      )
      .flatMap(([, balances]) =>
        Object.entries(balances)
          .filter(
            ([assetId]) =>
              !assetIdFilter || // No asset id filter requested
              assetId === uint8ArrayToBase64(assetIdFilter.inner), // Asset id's match
          )
          .map(([, balances]) => balances),
      );
  }

  private aggregateAmount(currentAmount: Amount, toAdd: SpendableNoteRecord) {
    const newAmount = addLoHi(
      { lo: currentAmount.lo, hi: currentAmount.hi },
      {
        lo: BigInt(toAdd.note?.value?.amount?.lo ?? 0n),
        hi: BigInt(toAdd.note?.value?.amount?.hi ?? 0n),
      },
    );
    currentAmount.lo = newAmount.lo;
    currentAmount.hi = newAmount.hi;
  }

  private async initializeBalResponse(n: SpendableNoteRecord) {
    const [accountAddress, balanceView] = await Promise.all([
      this.initializeAddressView(this.ctx, n.addressIndex),
      this.initializeValueView(this.ctx, getAssetIdFromRecord(n)),
    ]);
    return new BalancesResponse({ accountAddress, balanceView });
  }

  // Amount initialized to 0
  private async initializeValueView(ctx: HandlerContext, assetId: AssetId): Promise<ValueView> {
    const req = new AssetMetadataByIdRequest({ assetId });
    const { denomMetadata } = await assetMetadataById(req, ctx);

    if (!denomMetadata) {
      return new ValueView({
        valueView: { case: 'unknownAssetId', value: { assetId, amount: new Amount() } },
      });
    } else {
      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: { metadata: denomMetadata, amount: new Amount() },
        },
      });
    }
  }

  private async initializeAddressView(
    ctx: HandlerContext,
    addressIndex?: AddressIndex,
  ): Promise<AddressView> {
    const req = new AddressByIndexRequest({ addressIndex });
    const { address } = await addressByIndex(req, ctx);
    return new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          address,
          index: addressIndex,
        },
      },
    });
  }
}
