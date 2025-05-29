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

    // Try to find a matching wallet address that has the addressIndex information
    let enhancedAddress = effect.address;
    if (effect.address && walletAddressViews) {
      const effectAddress = effect.address; // Store in const for type narrowing

      // Look for a wallet address that matches this effect address
      const matchingWallet = walletAddressViews.find(walletAddr => {
        // Compare addresses - both should have the same address data
        if (
          walletAddr.addressView.case === 'decoded' &&
          effectAddress.addressView.case === 'decoded'
        ) {
          const walletInner = walletAddr.addressView.value.address?.inner;
          const effectInner = effectAddress.addressView.value.address?.inner;

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            return true;
          }
        }

        // Also check opaque addresses
        if (
          walletAddr.addressView.case === 'opaque' &&
          effectAddress.addressView.case === 'opaque'
        ) {
          const walletOpaque = walletAddr.addressView.value.address;
          const effectOpaque = effectAddress.addressView.value.address;

          // First try altBech32m comparison if both have it
          if (walletOpaque?.altBech32m && effectOpaque?.altBech32m) {
            if (walletOpaque.altBech32m === effectOpaque.altBech32m) {
              return true;
            }
          }

          // If altBech32m is not available, compare inner bytes
          const walletInner = walletOpaque?.inner;
          const effectInner = effectOpaque?.inner;

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            return true;
          }
        }

        // Cross-format comparison: wallet decoded vs effect opaque
        if (
          walletAddr.addressView.case === 'decoded' &&
          effectAddress.addressView.case === 'opaque'
        ) {
          const walletInner = walletAddr.addressView.value.address?.inner;
          const effectInner = effectAddress.addressView.value.address?.inner;

          if (
            walletInner &&
            effectInner &&
            walletInner.length === effectInner.length &&
            walletInner.every((byte, i) => byte === effectInner[i])
          ) {
            return true;
          }
        }

        return false;
      });

      // If we found a matching wallet address, use it instead as it has the addressIndex
      if (matchingWallet) {
        enhancedAddress = matchingWallet;
      } else {
        // Special handling for IBC deposit forwarding addresses
        // These are privacy addresses that don't match user's account addresses
        // but the funds still go to a user account (usually Main Account)
        if (effectAddress.addressView.case === 'opaque') {
          const opaqueAddress = effectAddress.addressView.value.address;
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- altBech32m can be undefined despite type inference
          if (opaqueAddress?.altBech32m?.startsWith('penumbra1')) {
            // Additional check for address length to identify forwarding addresses
            if (opaqueAddress.altBech32m.length > 100) {
              // For positive balances (deposits), try to find the Main Account (index 0)
              // This is a reasonable fallback since most IBC deposits go to Main Account
              const hasPositiveBalance = reduced.some(balance => !balance.negative);

              if (hasPositiveBalance) {
                // Find main account (index 0) - refactored to avoid optional chaining issues
                const mainAccount = walletAddressViews.find(addr => {
                  if (addr.addressView.case !== 'decoded') {
                    return false;
                  }
                  const decodedView = addr.addressView.value;
                  // Check if index exists and has account property equal to 0
                  return (
                    decodedView.index &&
                    'account' in decodedView.index &&
                    decodedView.index.account === 0
                  );
                });

                if (mainAccount) {
                  enhancedAddress = mainAccount;
                } else {
                  // If we can't find main account, use the first available account
                  const firstAccount = walletAddressViews.find(addr => {
                    if (addr.addressView.case !== 'decoded') {
                      return false;
                    }
                    const decodedView = addr.addressView.value;
                    // Check if index exists (is defined and not null)
                    return decodedView.index != null;
                  });

                  if (firstAccount) {
                    enhancedAddress = firstAccount;
                  }
                  // If still no match, keep the original forwarding address
                }
              }
            }
          }
        }
      }
    }

    return {
      balances: reduced,
      address: enhancedAddress,
    };
  });

  return result;
};
