import { TransactionSummary_Effects } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { GetMetadata } from '../ActionView/types';

export interface SummaryBalance {
  negative: boolean;
  view: ValueView;
}

export interface SummaryEffect {
  address?: AddressView;
  balances: SummaryBalance[];
}

/**
 * Extract the effects from TX summary and map assets to their metadata, while filtering irrelevant assets
 */
export const adaptEffects = (
  effects: TransactionSummary_Effects[],
  getMetadataByAssetId?: GetMetadata,
) => {
  const result = effects.map<SummaryEffect>(effect => {
    const reduced = (effect.balance?.values ?? []).reduce<SummaryEffect['balances']>(
      (accum, balance) => {
        const assetMetadata =
          balance.value?.assetId && getMetadataByAssetId?.(balance.value.assetId);
        const isNegative = !balance.negated;

        // if the asset is unknown, don't sum it up, show simply as unknown
        if (!assetMetadata?.penumbraAssetId?.inner) {
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

        // filter out the LpNFT and AuctionNFT assets based on display name from metadata
        if (
          assetPatterns.lpNft.matches(assetMetadata.display) ||
          assetPatterns.auctionNft.matches(assetMetadata.display)
        ) {
          return accum;
        }

        accum.push({
          negative: isNegative,
          view: new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                metadata: assetMetadata,
                amount: balance.value?.amount,
              },
            },
          }),
        });

        return accum;
      },
      [],
    );

    // sort the balances, non-negative first
    reduced.sort((a, b) => {
      if (a.negative === b.negative) {
        return 0;
      }
      return a.negative ? 1 : -1;
    });

    return {
      balances: reduced,
      address: effect.address,
    };
  });

  return result;
};
