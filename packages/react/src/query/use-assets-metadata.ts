import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { getDenomMetadata } from '@penumbra-zone/getters/assets-response';
import { ViewService } from '@penumbra-zone/protobuf';
import { useQuery } from '@tanstack/react-query';
import { usePenumbra } from '../hooks/use-penumbra';
import { usePenumbraService } from '../hooks/use-penumbra-service';

export const useAssetsMetadata = (assetId?: PartialMessage<AssetId>) => {
  const penumbra = usePenumbra();
  const viewClient = usePenumbraService(ViewService);
  return useQuery(
    [penumbra.origin, 'assetsMetadataById', assetId],
    async () => (await viewClient).assetMetadataById({ assetId }),
    { select: data => getDenomMetadata(data), enabled: !!assetId },
  );
};
