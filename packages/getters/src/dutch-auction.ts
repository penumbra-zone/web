import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { createGetter } from './utils/create-getter';

export const getDescription = createGetter(
  (dutchAuction?: DutchAuction) => dutchAuction?.description,
);
