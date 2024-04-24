import { createContextKey } from '@connectrpc/connect';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export const stakingTokenIdCtx = createContextKey<AssetId | undefined>(undefined);
