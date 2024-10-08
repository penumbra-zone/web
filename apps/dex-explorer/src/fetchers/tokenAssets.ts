import { useRegistry } from './registry';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { decimalsFromDenomUnits, imagePathFromAssetImages } from '@/old/utils/token/tokenFetch';
import { uint8ArrayToBase64, base64ToUint8Array } from '@/old/utils/math/base64';
import { Token } from '@/old/utils/types/token';

export const useTokenAssets = () => {
  const { data: registry, isLoading: isRegistryLoading, error: registryError } = useRegistry();
  const data: Metadata[] = registry?.getAllAssets() ?? [];

  return {
    data,
    isLoading: isRegistryLoading,
    error: registryError,
  };
};

export const useTokenAsset = (tokenId: Uint8Array | string) => {
  const { data: registry, isLoading: isRegistryLoading, error: registryError } = useRegistry();

  const assetId: AssetId = new AssetId();
  assetId.inner = typeof tokenId !== 'string' ? tokenId : base64ToUint8Array(tokenId);
  const tokenMetadata = registry?.getMetadata(assetId);

  return {
    data: tokenMetadata,
    isLoading: isRegistryLoading,
    error: registryError,
  };
};

export const useTokenAssetsDeprecated = () => {
  const { data: registry, isLoading: isRegistryLoading, error: registryError } = useRegistry();
  const assets: Metadata[] = registry?.getAllAssets() ?? [];

  const tokenAssets = assets
    .filter(asset => asset.penumbraAssetId && !asset.display.startsWith('delegation_'))
    .map(asset => {
      const displayParts = asset.display.split('/');
      return {
        decimals: decimalsFromDenomUnits(asset.denomUnits),
        display: displayParts[displayParts.length - 1] ?? '',
        symbol: asset.symbol,
        inner: asset.penumbraAssetId?.inner && uint8ArrayToBase64(asset.penumbraAssetId.inner),
        imagePath: imagePathFromAssetImages(asset.images),
      };
    }) as Token[];

  return {
    data: tokenAssets,
    isLoading: isRegistryLoading,
    error: registryError,
  };
};

export const useTokenAssetDeprecated = (tokenId: Uint8Array | string) => {
  const { data: registry, isLoading: isRegistryLoading, error: registryError } = useRegistry();

  let tokenAsset = undefined;
  if (registry) {
    const assetId: AssetId = new AssetId();
    assetId.inner = typeof tokenId !== 'string' ? tokenId : base64ToUint8Array(tokenId);
    const tokenMetadata = registry.getMetadata(assetId);

    const displayParts = tokenMetadata.display.split('/');
    tokenAsset = {
      decimals: decimalsFromDenomUnits(tokenMetadata.denomUnits),
      display: displayParts[displayParts.length - 1] ?? '',
      symbol: tokenMetadata.symbol,
      inner: typeof tokenId !== 'string' ? uint8ArrayToBase64(tokenId) : tokenId,
      imagePath: imagePathFromAssetImages(tokenMetadata.images),
    };
  }

  return {
    data: tokenAsset,
    isLoading: isRegistryLoading,
    error: registryError,
  };
};
