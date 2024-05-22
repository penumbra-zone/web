import { uint8ArrayToBase64, base64ToUint8Array } from "../../utils/math/base64";
import { testnetConstants } from "../../constants/configConstants";
import { AssetId, AssetImage, DenomUnit, Metadata } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb";
import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { Token } from "../types/token";

const getRegistry = (): Registry => {
  const chainId = testnetConstants.chainId
  const registryClient = new ChainRegistryClient()
  return registryClient.get(chainId)
};

export const fetchAllTokenAssets = (): Token[] => {
  const registry = getRegistry();
  const metadata = registry.getAllAssets();
  const tokens : Token[] = []
  metadata.forEach((x) => {
    // Filter out assets with no assetId and "Delegation" assets -- need to check this
    if (x.penumbraAssetId && !x.display.startsWith("delegation_")) {
      const displayParts = x.display.split('/')
      tokens.push(
        {
          'decimals': decimalsFromDenomUnits(x.denomUnits),
          'display': displayParts[displayParts.length - 1],
          'symbol': x.symbol,
          'inner': uint8ArrayToBase64(x.penumbraAssetId?.inner),
          'imagePath': imagePathFromAssetImages(x.images)
        }
      )
    }
  })
  return tokens
}

export const fetchTokenAsset = (tokenId: Uint8Array | string): Token | undefined => {
  const assetId: AssetId = new AssetId()
  assetId.inner = typeof tokenId !== 'string' ? tokenId : base64ToUint8Array(tokenId);

  const registry = getRegistry();
  const tokenMetadata = registry.getMetadata(assetId)
  const displayParts = tokenMetadata.display.split('/')
  return {
    'decimals': decimalsFromDenomUnits(tokenMetadata.denomUnits),
    'display': displayParts[displayParts.length - 1],
    'symbol': tokenMetadata.symbol,
    'inner': typeof tokenId !== 'string' ? uint8ArrayToBase64(tokenId) : tokenId,
    'imagePath': imagePathFromAssetImages(tokenMetadata.images)
  }
}

export const imagePathFromAssetImages = (assetImages: AssetImage[]): string | undefined => {
  // Take first png/svg from first AssetImage
  var imagePath: string | undefined = undefined
  assetImages.forEach((x) => {
    if (x.png.length > 0) {
      imagePath = x.png
    }
    else if (x.svg.length > 0) {
      imagePath = x.svg
    }
  })
  return imagePath
}

export const decimalsFromDenomUnits = (denomUnits: DenomUnit[]): number => {
  // Search denomUnits for highest exponent
  var decimals = 0
  denomUnits.forEach((x) => {
    if (x.exponent >= decimals) {
      decimals = x.exponent
    }
  })
  return decimals
}
