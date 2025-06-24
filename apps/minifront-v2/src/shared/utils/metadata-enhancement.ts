import { Metadata, AssetImage } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Centralized function to enhance asset metadata within the minifront application.
 * This function should be used in the data/state management layer to ensure that
 * all metadata consumed by UI components is consistently enhanced.
 *
 * It performs the following enhancements:
 * - Standardizes the symbol of delegation tokens (e.g., 'delUM(validator)' to 'delUM').
 * - Sets a canonical name for 'delUM' and 'UM' assets.
 * - Ensures 'delUM' and 'UM' assets have the correct Penumbra icon URL in their `images` array.
 *
 * @param metadata The original metadata object.
 * @returns A new, enhanced metadata object, or the original if no enhancements were applicable, or undefined if input was undefined.
 */
export const centralEnhanceMetadata = (metadata: Metadata | undefined): Metadata | undefined => {
  if (!metadata) {
    return undefined;
  }

  const clonedMetadata = metadata.clone();
  let modified = false;

  // Enhancement for 'delUM' (Delegated Penumbra)
  if (clonedMetadata.symbol?.startsWith('delUM(') || clonedMetadata.symbol === 'delUM') {
    if (clonedMetadata.symbol !== 'delUM') {
      clonedMetadata.symbol = 'delUM';
      modified = true;
    }
    if (clonedMetadata.name !== 'Delegated Penumbra') {
      clonedMetadata.name = 'Delegated Penumbra';
      modified = true;
    }
    const penumbraIconSvg =
      'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg';
    if (!clonedMetadata.images.some(img => img.svg === penumbraIconSvg)) {
      clonedMetadata.images = [new AssetImage({ svg: penumbraIconSvg })];
      modified = true;
    }
  }
  // Enhancement for 'UM' (Penumbra)
  else if (clonedMetadata.symbol === 'UM') {
    if (clonedMetadata.name !== 'Penumbra') {
      clonedMetadata.name = 'Penumbra';
      modified = true;
    }
    const penumbraIconSvg =
      'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg';
    // Ensure 'UM' also gets its icon if missing, and it's the primary image.
    if (!clonedMetadata.images.some(img => img.svg === penumbraIconSvg)) {
      clonedMetadata.images = [new AssetImage({ svg: penumbraIconSvg })];
      modified = true;
    }
  }

  return modified ? clonedMetadata : metadata; // Return clone only if modified, else original
};

/**
 * Helper function to determine if an asset is a delegation token based on its symbol.
 * This can be used by UI components to determine if they should show delegation badges.
 *
 * @param symbol The asset symbol to check
 * @returns true if the asset is a delegation token
 */
export const isDelegationToken = (symbol?: string): boolean => {
  if (!symbol) {
    return false;
  }
  return symbol === 'delUM' || symbol.startsWith('delUM(');
};
