import { Metadata, AssetImage } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Cleans asset symbols and provides display information.
 * This is used to display cleaner asset names in the UI.
 *
 * NOTE: The special handling for delUM tokens is a TEMPORARY solution until
 * delegation tokens have proper registry entries with better metadata.
 * Once the registry is updated, this special case handling should be removed.
 *
 * Examples:
 * - "delUM(zzhmj6gpmkln7gsfcq092ceymwk8e3grzvl3y2g03rh7vl6y9s3ct38l)" -> { symbol: "delUM", displayName: "Delegated Penumbra", isDelegation: true }
 * - "unbondUMat123(abc...xyz)" -> { symbol: "unbondUMat123", displayName: null, isDelegation: false }
 * - "UM" -> { symbol: "UM", displayName: null, isDelegation: false }
 */
export interface CleanedAssetInfo {
  symbol: string;
  displayName: string | null;
  isDelegation: boolean;
}

export const cleanAssetSymbol = (symbol: string): CleanedAssetInfo => {
  // Remove everything after the opening bracket
  const bracketIndex = symbol.indexOf('(');
  const cleanedSymbol = bracketIndex === -1 ? symbol : symbol.substring(0, bracketIndex);

  // TEMPORARY: Special handling for delegation tokens
  // TODO: Remove this once delegation tokens have proper registry entries
  if (cleanedSymbol === 'delUM') {
    return {
      symbol: cleanedSymbol,
      displayName: 'Delegated Penumbra',
      isDelegation: true,
    };
  }

  return {
    symbol: cleanedSymbol,
    displayName: null,
    isDelegation: false,
  };
};

/**
 * Gets enhanced asset information including icon URL for delegation tokens.
 * This builds on cleanAssetSymbol to provide additional display data.
 *
 * @param symbol - The asset symbol to analyze
 * @returns Enhanced asset information with icon data
 */
export interface EnhancedAssetInfo extends CleanedAssetInfo {
  icon?: string;
}

export const getEnhancedAssetInfo = (symbol: string): EnhancedAssetInfo => {
  const cleaned = cleanAssetSymbol(symbol);

  if (cleaned.isDelegation) {
    return {
      ...cleaned,
      icon: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    };
  }

  return cleaned;
};

/**
 * Creates enhanced metadata for delegation tokens with proper icon, badge, and clean symbol.
 * This is a replacement for enhanceDelegationMetadata that uses cleanAssetSymbol internally.
 *
 * @param metadata - The original metadata
 * @returns Enhanced metadata with correct icon, badge, and clean symbol for delegation tokens
 */
export const createEnhancedMetadata = (metadata: Metadata): Metadata => {
  const enhancedInfo = getEnhancedAssetInfo(metadata.symbol);

  // Create a copy of the metadata to avoid mutating the original
  const enhanced = metadata.clone();

  // Always clean the symbol by removing parentheses and content after them
  enhanced.symbol = enhancedInfo.symbol;

  // If it's a delegation token, apply special handling
  if (enhancedInfo.isDelegation) {
    // Set the icon to Penumbra icon
    if (enhancedInfo.icon) {
      enhanced.images = [
        new AssetImage({
          svg: enhancedInfo.icon,
        }),
      ];
    }

    // Set the display name if available
    if (enhancedInfo.displayName) {
      enhanced.name = enhancedInfo.displayName;
    }
  }

  return enhanced;
};
