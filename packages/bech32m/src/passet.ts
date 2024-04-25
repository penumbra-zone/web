import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.passet;
const prefix = Prefixes.passet;

export const bech32mAssetId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const assetIdFromBech32m = (passet1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(passet1 as `${typeof prefix}1${string}`, prefix),
});

export const isAssetId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    assetIdFromBech32m(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_ASSETID_LENGTH, PENUMBRA_BECH32M_ASSETID_PREFIX } from '.';
