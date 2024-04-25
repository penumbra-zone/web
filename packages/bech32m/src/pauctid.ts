import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.pauctid;
const prefix = Prefixes.pauctid;

export const bech32mAuctionId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const auctionIdFromBech32 = (pauctid1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(pauctid1 as `${typeof prefix}1${string}`, prefix),
});

export const isAuctionId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    auctionIdFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_AUCTION_LENGTH, PENUMBRA_BECH32M_AUCTION_PREFIX } from '.';
