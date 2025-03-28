import { AssetId, Metadata, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { pnum } from '@penumbra-zone/types/pnum';

/** A basic utility class containing information we need about an asset.
 *
 * This extracts out the useful components we might need for the current
 * asset.
 */
export class AssetInfo {
  /**
   * @param balance the balance, in display units.
   * @param the exponent to convert from base units to display units.
   */
  constructor(
    public metadata: Metadata,
    public id: AssetId,
    public exponent: number,
    public symbol: string,
    public balance?: number,
  ) {}

  static fromMetadata(metadata: Metadata, balance?: Amount): undefined | AssetInfo {
    const displayDenom = metadata.denomUnits.find(x => x.denom === metadata.display);
    if (!displayDenom || !metadata.penumbraAssetId) {
      return undefined;
    }
    return new AssetInfo(
      metadata,
      metadata.penumbraAssetId,
      displayDenom.exponent,
      metadata.symbol,
      balance && pnum(balance, displayDenom.exponent).toNumber(),
    );
  }

  /** Convert an amount, in display units, into a Value (of this asset). */
  value(display: number): Value {
    return new Value({
      amount: pnum(display, this.exponent).toAmount(),
      assetId: this.id,
    });
  }

  /** Format an amount (in display units) as a simple string. */
  formatDisplayAmount(amount: number): string {
    const amountString = pnum(amount, this.exponent).toFormattedString({
      commas: true,
      decimals: 4,
      trailingZeros: false,
    });
    return `${amountString} ${this.symbol}`;
  }

  /** Format the balance of this asset as a simple string. */
  formatBalance(): undefined | string {
    return this.balance !== undefined ? this.formatDisplayAmount(this.balance) : undefined;
  }
}
