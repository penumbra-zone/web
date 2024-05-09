import { fromBech32, toBech32 } from './format/convert';
import { Inner } from './format/inner';
import { Prefixes } from './format/prefix';

const innerName = Inner.penumbracompat1;
const prefix = Prefixes.penumbracompat1;

export const bech32CompatAddress = ({ [innerName]: bytes }: { [innerName]: Uint8Array }) =>
  toBech32(bytes, prefix);

export const compatAddressFromBech32 = (penumbracompat1: string): { [innerName]: Uint8Array } => ({
  [innerName]: fromBech32(penumbracompat1 as `${typeof prefix}1${string}`, prefix),
});

export { PENUMBRA_BECH32M_ADDRESS_LENGTH, PENUMBRA_BECH32M_ADDRESS_PREFIX } from '.';
