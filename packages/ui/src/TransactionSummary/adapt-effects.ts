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
  walletAddressViews?: AddressView[],
) => {
  return effects.map<SummaryEffect>(effect => {
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

        // filter out the LpNFT and AuctionNFT assets
        if (
          assetPatterns.lpNft.matches(asset.display) ||
          assetPatterns.auctionNft.matches(asset.display)
        ) {
          return accum;
        }

        accum.push({
          negative: isNegative,
          view: new ValueView({
            valueView: {
              case: 'knownAssetId',
              value: {
                metadata: asset,
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

    // Try to find a matching wallet address that has the addressIndex information
    let enhancedAddress = effect.address;
    if (effect.address && walletAddressViews) {
      console.log('DEBUG: Trying to match effect address:', effect.address);
      console.log('DEBUG: Available wallet addresses:', walletAddressViews);

      // Look for a wallet address that matches this effect address
      const matchingWallet = walletAddressViews.find(walletAddr => {
        if (!walletAddr || !effect.address) return false;

        // Compare addresses - both should have the same address data
        if (
          walletAddr.addressView.case === 'decoded' &&
          effect.address.addressView.case === 'decoded'
        ) {
          const walletInner = walletAddr.addressView.value.address?.inner;
          const effectInner = effect.address.addressView.value.address?.inner;

          console.log('DEBUG: Comparing decoded addresses');
          console.log('DEBUG: Wallet inner:', walletInner);
          console.log('DEBUG: Effect inner:', effectInner);

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            console.log('DEBUG: Found matching decoded address!');
            return true;
          }
        }

        // Also check opaque addresses
        if (
          walletAddr.addressView.case === 'opaque' &&
          effect.address.addressView.case === 'opaque'
        ) {
          const walletOpaque = walletAddr.addressView.value.address;
          const effectOpaque = effect.address.addressView.value.address;

          // First try altBech32m comparison if both have it
          if (walletOpaque?.altBech32m && effectOpaque?.altBech32m) {
            console.log('DEBUG: Comparing opaque addresses by altBech32m');
            console.log('DEBUG: Wallet bech32:', walletOpaque.altBech32m);
            console.log('DEBUG: Effect bech32:', effectOpaque.altBech32m);

            if (walletOpaque.altBech32m === effectOpaque.altBech32m) {
              console.log('DEBUG: Found matching opaque address by altBech32m!');
              return true;
            }
          }

          // If altBech32m is not available, compare inner bytes
          const walletInner = walletOpaque?.inner;
          const effectInner = effectOpaque?.inner;

          console.log('DEBUG: Comparing opaque addresses by inner bytes');
          console.log('DEBUG: Wallet inner:', walletInner);
          console.log('DEBUG: Effect inner:', effectInner);

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            console.log('DEBUG: Found matching opaque address by inner bytes!');
            return true;
          }
        }

        // Cross-format comparison: wallet decoded vs effect opaque
        if (
          walletAddr.addressView.case === 'decoded' &&
          effect.address.addressView.case === 'opaque'
        ) {
          const walletInner = walletAddr.addressView.value.address?.inner;
          const effectInner = effect.address.addressView.value.address?.inner;

          console.log('DEBUG: Cross-comparing decoded wallet vs opaque effect');
          console.log('DEBUG: Wallet inner (decoded):', walletInner);
          console.log('DEBUG: Effect inner (opaque):', effectInner);

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            console.log('DEBUG: Found matching address (decoded wallet vs opaque effect)!');
            return true;
          }
        }

        return false;
      });

      // If we found a matching wallet address, use it instead as it has the addressIndex
      if (matchingWallet) {
        console.log('DEBUG: Using matched wallet address with addressIndex:', matchingWallet);
        enhancedAddress = matchingWallet;
      } else {
        console.log('DEBUG: No matching wallet address found');
      }
    }

    return {
      balances: reduced,
      address: enhancedAddress,
    };
  });
};
