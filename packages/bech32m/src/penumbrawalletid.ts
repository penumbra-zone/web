import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbrawalletid;
const prefix = Prefixes.penumbrawalletid;

export const bech32mWalletId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const walletIdFromBech32m = (penumbrawalletid1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbrawalletid1 as `${typeof prefix}1${string}`, prefix),
});

export const isWalletId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    walletIdFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_WALLETID_LENGTH, PENUMBRA_BECH32M_WALLETID_PREFIX } from '.';
