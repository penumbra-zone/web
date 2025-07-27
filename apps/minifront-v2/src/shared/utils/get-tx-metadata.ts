import { AssetId, Denom, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

// Type definition compatible with UI components' GetMetadata interface
export type GetMetadata = (assetId: AssetId | Denom | undefined) => Metadata | undefined;

// Utility function to compare Uint8Arrays
const compareUint8Arrays = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Centralized function to get transaction metadata from balances responses.
 * This function provides a consistent way to resolve asset metadata across all transaction-related components.
 *
 * @param assetId - The AssetId, Denom, or string to look up metadata for
 * @param balancesResponses - Array of BalancesResponse to search through
 * @returns Metadata if found, undefined otherwise
 */
export const getTxMetadata = (
  assetId?: AssetId | Denom | string | undefined,
  balancesResponses: BalancesResponse[] = [],
): Metadata | undefined => {
  if (!assetId) {
    return undefined;
  }

  let rawMetadata: Metadata | undefined;

  // Check for AssetId first
  if (assetId instanceof AssetId) {
    for (const res of balancesResponses) {
      const meta = getMetadataFromBalancesResponse.optional(res);
      if (
        meta?.penumbraAssetId?.inner &&
        compareUint8Arrays(meta.penumbraAssetId.inner, assetId.inner)
      ) {
        rawMetadata = meta;
        break;
      }
    }
  } else {
    // Must be Denom or string
    const denomToFind = typeof assetId === 'string' ? assetId : assetId.denom;
    for (const res of balancesResponses) {
      const meta = getMetadataFromBalancesResponse.optional(res);
      if (meta) {
        if (
          meta.base === denomToFind ||
          meta.display === denomToFind ||
          meta.symbol === denomToFind
        ) {
          rawMetadata = meta;
          break;
        }
      }
    }
  }

  return rawMetadata;
};

/**
 * Higher-order function that creates a getTxMetadata function bound to specific balances responses.
 * This is useful in components that want to create a reusable metadata getter.
 * Compatible with the GetMetadata type expected by UI components.
 *
 * @param balancesResponses - Array of BalancesResponse to bind to
 * @returns A function that takes assetId and returns metadata (compatible with GetMetadata type)
 */
export const createGetTxMetadata = (balancesResponses: BalancesResponse[]): GetMetadata => {
  return (assetId: AssetId | Denom | undefined): Metadata | undefined => {
    return getTxMetadata(assetId, balancesResponses);
  };
};
