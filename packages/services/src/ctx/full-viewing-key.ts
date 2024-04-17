import { createContextKey } from '@connectrpc/connect';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const fvkCtx = createContextKey<FullViewingKey | undefined>(undefined);
