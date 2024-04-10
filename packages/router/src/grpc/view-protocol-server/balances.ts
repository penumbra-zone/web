import type { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';
import { getAmount } from '@penumbra-zone/getters/src/value-view';
import { getAssetIdFromRecord } from '@penumbra-zone/getters/src/spendable-note-record';
import {
  AssetId,
  EquivalentValue,
  EstimatedPrice,
  Metadata,
  ValueView,
  ValueView_KnownAssetId,
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
import { Base64Str, uint8ArrayToBase64 } from '@penumbra-zone/types/src/base64';
import { addLoHi } from '@penumbra-zone/types/src/lo-hi';
import { IndexedDbInterface } from '@penumbra-zone/types/src/indexed-db';
import { multiplyAmountByNumber } from '@penumbra-zone/types/src/amount';
import { Stringified } from '@penumbra-zone/types/src/jsonified';

// Handles aggregating amounts and filtering by account number/asset id
export const balances: Impl['balances'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb, querier } = await services.getWalletServices();

  // latestBlockHeight is needed to calculate the threshold of price relevance,
  //it is better to use  rather than fullSyncHeight to avoid displaying old prices during the synchronization process
  const latestBlockHeight = await querier.tendermint.latestBlockHeight();

  const aggregator = new BalancesAggregator(ctx, indexedDb, latestBlockHeight);

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
  private readonly estimatedPriceByPricedAsset: Record<
    Stringified<AssetId['inner']>,
    EstimatedPrice[]
  > = {};

  constructor(
    private readonly ctx: HandlerContext,
    private readonly indexedDb: IndexedDbInterface,
    private readonly latestBlockHeight: bigint,
  ) {}

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
    const valueView = this.accounts[accountNumber]![assetIdBase64]!.balanceView!;
    this.aggregateAmount(valueView, n);
    await this.aggregateEquivalentValues(valueView, n);
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

  private aggregateAmount(valueView: ValueView, toAdd: SpendableNoteRecord) {
    const currentAmount = getAmount(valueView);
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

  /**
   * Attach equivalent values to the `ValueView`, based on the estimated price
   * of the equivalent value and the `amount` of the `ValueView`.
   */
  private async aggregateEquivalentValues(valueView: ValueView, toAdd: SpendableNoteRecord) {
    const assetId = getAssetIdFromRecord.optional()(toAdd);
    if (!assetId?.inner) return;

    const amount = getAmount(valueView);

    const equivalentValues: EquivalentValue[] = [];

    for (const price of this.estimatedPriceByPricedAsset[uint8ArrayToBase64(assetId.inner)] ?? []) {
      if (!price.numeraire) continue;

      const numeraire = await assetMetadataById(
        new AssetMetadataByIdRequest({ assetId: price.numeraire }),
        this.ctx,
      );
      if (!numeraire.denomMetadata) continue;

      const equivalentAmount = multiplyAmountByNumber(amount, price.numerairePerUnit);

      equivalentValues.push(
        new EquivalentValue({
          asOfHeight: price.asOfHeight,
          numeraire: numeraire.denomMetadata,
          equivalentAmount,
        }),
      );
    }

    (valueView.valueView.value as ValueView_KnownAssetId).equivalentValues = equivalentValues;
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
      if (!this.estimatedPriceByPricedAsset[uint8ArrayToBase64(assetId.inner)]) {
        const prices = await this.indexedDb.getPricesForAsset(
          denomMetadata as Metadata,
          this.latestBlockHeight,
        );
        this.estimatedPriceByPricedAsset[uint8ArrayToBase64(assetId.inner)] = prices;
      }

      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: denomMetadata,
            amount: new Amount(),
          },
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
