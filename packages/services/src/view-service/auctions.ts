import { AuctionsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '.';

export const auctions: Impl['auctions'] = async function* (req, ctx) {
  /**
   * @todo:
   * 1. Get all balances from the given account in `accountFilter`.
   * 2. Filter for those that match `assetPatterns.auctionNft`.
   * 3. Convert the bech32 auction ID to a base 64 auction ID we can query the DB with.
   * 4. Query the database by auction ID to get the note commitment
   */
  yield new AuctionsResponse({});
};
