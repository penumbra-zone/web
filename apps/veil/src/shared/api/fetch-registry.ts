import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

/*
 * Represents a registry in a nicely serializable package.
 *
 * This should probably just be exported from the library (TODO).
 */
export type JsonRegistry = ConstructorParameters<typeof Registry>[0];

const CLIENT = new ChainRegistryClient();

export async function fetchRegistry(chainId: string): Promise<Registry> {
  return await CLIENT.remote.getWithBundledBackup(chainId);
}

async function fetchJsonRegistry(chainId: string): Promise<JsonRegistry> {
  const registry = await fetchRegistry(chainId);
  // We use type-foo because this type isn't exported.
  const assetById: JsonRegistry['assetById'] = {};
  for (const metadata of registry.getAllAssets()) {
    const assetId = metadata.penumbraAssetId;
    if (!assetId) {
      // We don't want this to throw an error, but we should have some kind of warning.
      console.warn('Found a metadata entry with no asset ID', { chainId, metadata });
      continue;
    }
    // Safe, assuming the upstream API is well-formed, but really we should add provisions
    // to the registry to do this.
    assetById[uint8ArrayToBase64(assetId.inner)] = JSON.parse(
      JSON.stringify(metadata),
    ) as JsonRegistry['assetById'][string];
  }
  return {
    chainId: registry.chainId,
    ibcConnections: registry.ibcConnections,
    numeraires: registry.numeraires.map(x => uint8ArrayToBase64(x.inner)),
    assetById,
  };
}

/**
 * A JSONified registry, along with the staking token.
 *
 * This is suitable for passing across an API boundary.
 */
export interface JsonRegistryWithGlobals {
  stakingAssetIdBase64: string;
  registry: JsonRegistry;
}

/**
 * Fetch registry information, for a given chain id.
 *
 * This will make a fresh call to the remote registry.
 */
export async function fetchJsonRegistryWithGlobals(
  chainId: string,
): Promise<JsonRegistryWithGlobals> {
  const registry = await fetchJsonRegistry(chainId);
  const stakingAssetId = CLIENT.bundled.globals().stakingAssetId;
  return {
    registry,
    stakingAssetIdBase64: uint8ArrayToBase64(stakingAssetId.inner),
  };
}
