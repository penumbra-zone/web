import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.plpid;
const prefix = Prefixes.plpid;

export const bech32mPositionId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const positionIdFromBech32 = (plpid1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(plpid1 as `${typeof prefix}1${string}`, prefix),
});

export const isPositionId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    positionIdFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_POSITIONID_LENGTH, PENUMBRA_BECH32M_POSITIONID_PREFIX } from '.';
