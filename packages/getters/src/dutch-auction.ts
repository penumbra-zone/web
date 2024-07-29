import { DutchAuction } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getDescription = createGetter(
  (dutchAuction?: DutchAuction) => dutchAuction?.description,
);

export const getInputAssetId = createGetter(
  (dutchAuction?: DutchAuction) => dutchAuction?.description?.input?.assetId,
);

export const getOutputAssetId = createGetter(
  (dutchAuction?: DutchAuction) => dutchAuction?.description?.outputId,
);
