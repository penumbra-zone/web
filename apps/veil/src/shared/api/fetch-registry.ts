import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

/*
 * Represents a registry in a nicely serializable package.
 *
 * This should probably just be exported from the library (TODO).
 */
export type JsonRegistry = ConstructorParameters<typeof Registry>[0];

/**
 * @module fetch-registry
 *
 * This module provides utilities to fetch the raw JSON of a remote registry.
 */
export async function fetchJsonRegistry(chainId: string): Promise<JsonRegistry> {
  const registry = await new ChainRegistryClient().remote.getWithBundledBackup(chainId);
  // We use type-foo because this type isn't exported.
  const assetById: JsonRegistry['assetById'] = {};
  for (const metadata of registry.getAllAssets()) {
    const assetId = metadata.penumbraAssetId;
    if (!assetId) {
      // We don't want this to throw an error, but we should have some kind of warning.
      console.warn('Found a metadata entry with no asset ID', { chainId, metadata });
      continue;
    }
    assetById[uint8ArrayToBase64(assetId.inner)] = {
      ...metadata,
      penumbraAssetId: { inner: uint8ArrayToBase64(assetId.inner) },
    };
  }
  return {
    chainId: registry.chainId,
    ibcConnections: registry.ibcConnections,
    numeraires: registry.numeraires.map(x => uint8ArrayToBase64(x.inner)),
    assetById,
  };
}
