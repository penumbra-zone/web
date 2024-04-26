import { fromBech32m, toBech32m } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbragovern;
const prefix = Prefixes.penumbragovern;

export const bech32mGovernanceId = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32m(bytes, prefix);

export const governanceIdFromBech32 = (penumbragovern1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32m(penumbragovern1 as `${typeof prefix}1${string}`, prefix),
});

export const isGovernanceId = (check: string): check is `${typeof prefix}1${string}` => {
  try {
    governanceIdFromBech32(check);
    return true;
  } catch {
    return false;
  }
};

export { PENUMBRA_BECH32M_GOVERNANCEID_LENGTH, PENUMBRA_BECH32M_GOVERNANCEID_PREFIX } from '.';
