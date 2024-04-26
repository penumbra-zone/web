import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbravalid;
const prefix = Prefixes.penumbravalid;

export const bech32mIdentityKey = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const identityKeyFromBech32m = (penumbravalid1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbravalid1 as `${typeof prefix}1${string}`, prefix),
});

export const isIdentityKey = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    identityKeyFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_IDENTITYKEY_LENGTH, PENUMBRA_BECH32M_IDENTITYKEY_PREFIX } from '.';
