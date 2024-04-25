import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbrafullviewingkey;
const prefix = Prefixes.penumbrafullviewingkey;

export const bech32mFullViewingKey = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const fullViewingKeyFromBech32m = (
  penumbrafullviewingkey1: string,
): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbrafullviewingkey1 as `${typeof prefix}1${string}`, prefix),
});

export const isFullViewingKey = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    fullViewingKeyFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_FULLVIEWINGKEY_LENGTH, PENUMBRA_BECH32M_FULLVIEWINGKEY_PREFIX } from '.';
