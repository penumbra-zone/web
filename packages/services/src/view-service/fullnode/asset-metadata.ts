import {
  AssetId,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Transport, createPromiseClient } from '@connectrpc/connect';
import { ShieldedPoolService } from '@penumbra-zone/protobuf';

export const queryAssetMetadata = async (
  fullnode: Transport,
  assetId: AssetId,
): Promise<Metadata | undefined> => {
  const shieldedPoolClient = createPromiseClient(ShieldedPoolService, fullnode);

  const { denomMetadata } =
    (await shieldedPoolClient.assetMetadataById({ assetId }).catch(() => undefined)) ?? {};

  return denomMetadata;
};
