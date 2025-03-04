import { TransactionSummary_Effects } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { getAmount } from '@penumbra-zone/getters/value-view';
import { pnum } from '@penumbra-zone/types/pnum';
import { GetMetadataByAssetId } from '../ActionView/types';

export interface SummaryBalance {
  negative: boolean;
  view: ValueView;
}

export interface SummaryEffect {
  address?: AddressView;
  balances: SummaryBalance[];
}

const LPNFT_SYMBOL = 'LPNFT';
const AUCTION_SYMBOL = 'AUCT';

/**
 * Extract the effects from TX summary and map assets to their metadata and sum up all repeated values by assets.
 * Also, categorizes the assets by their type like LPNFT and AUCT, even if their assetIds are different.
 */
export const sumBalances = (
  effects: TransactionSummary_Effects[],
  getMetadataByAssetId?: GetMetadataByAssetId,
) => {
  return effects.map<SummaryEffect>(effect => {
    const valueByAsset = new Map<string, SummaryBalance>();

    const reduced = (effect.balance?.values ?? []).reduce<SummaryEffect['balances']>(
      (accum, balance) => {
        const asset = balance.value?.assetId && getMetadataByAssetId?.(balance.value.assetId);
        const isNegative = !balance.negated;

        // if the asset is unknown, don't sum it up, show simply as unknown
        if (!asset?.penumbraAssetId?.inner) {
          accum.push({
            negative: isNegative,
            view: new ValueView({
              valueView: {
                case: 'unknownAssetId',
                value: {
                  amount: balance.value?.amount,
                  assetId: balance.value?.assetId,
                },
              },
            }),
          });
          return accum;
        }

        // hash needs to combine similar assets together,
        // e.g. LPNFTs get summed up even though they have different assetIds
        let hash = uint8ArrayToBase64(asset.penumbraAssetId.inner);
        if (assetPatterns.lpNft.matches(asset.display)) {
          hash = LPNFT_SYMBOL;
          asset.symbol = LPNFT_SYMBOL;
        } else if (assetPatterns.auctionNft.matches(asset.display)) {
          hash = AUCTION_SYMBOL;
          asset.symbol = AUCTION_SYMBOL;
        }

        const view = new ValueView({
          valueView: {
            case: 'knownAssetId',
            value: {
              metadata: asset,
              amount: balance.value?.amount,
            },
          },
        });

        const existing = valueByAsset.get(hash);
        if (!existing) {
          valueByAsset.set(hash, {
            negative: isNegative,
            view,
          });
          return accum;
        }

        const one = pnum(existing.view)
          .toBigNumber()
          .multipliedBy(existing.negative ? -1 : 1);
        const two = pnum(view)
          .toBigNumber()
          .multipliedBy(isNegative ? -1 : 1);
        const sum = one.plus(two);

        valueByAsset.set(hash, {
          negative: sum.isNegative(),
          view: pnum(sum.abs().toNumber()).toValueView(asset),
        });

        return accum;
      },
      [],
    );

    const summed = Array.from(valueByAsset.values()).filter(value => {
      const amount = getAmount.optional(value.view);
      return amount && (amount.hi !== 0n || amount.lo !== 0n);
    });

    return {
      address: effect.address,
      balances: summed.concat(reduced),
    };
  });
};
