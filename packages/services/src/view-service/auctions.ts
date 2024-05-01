import { AuctionsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '.';

export const auctions: Impl['auctions'] = async function* (req, ctx) {
  yield new AuctionsResponse();
};
