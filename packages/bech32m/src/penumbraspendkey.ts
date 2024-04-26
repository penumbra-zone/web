import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbraspendkey;
const prefix = Prefixes.penumbraspendkey;

export const bech32mSpendKey = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const spendKeyFromBech32m = (penumbraspendkey1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbraspendkey1 as `${typeof prefix}1${string}`, prefix),
});

export const isSpendKey = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    spendKeyFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_SPENDKEY_LENGTH, PENUMBRA_BECH32M_SPENDKEY_PREFIX } from '.';
