import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbra;
const prefix = Prefixes.penumbra;

export const bech32mAddress = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const addressFromBech32m = (penumbra1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbra1 as `${typeof prefix}1${string}`, prefix),
});

export const isAddress = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    addressFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_ADDRESS_LENGTH, PENUMBRA_BECH32M_ADDRESS_PREFIX } from '.';
