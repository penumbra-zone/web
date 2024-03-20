import { PENUMBRA_BECH32_ADDRESS_LENGTH, PENUMBRA_BECH32_ADDRESS_PREFIX } from './penumbra-bech32';
import { bech32m } from 'bech32';

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const bech32Address = (addr: { inner: Uint8Array }) =>
  bech32m.encode(
    PENUMBRA_BECH32_ADDRESS_PREFIX,
    bech32m.toWords(addr.inner),
    PENUMBRA_BECH32_ADDRESS_LENGTH,
  ) as `${typeof PENUMBRA_BECH32_ADDRESS_PREFIX}1${string}`;

export const bech32ToAddress = (addr: string) => {
  const decodeAddress = bech32m.decode(addr, PENUMBRA_BECH32_ADDRESS_LENGTH);
  return new Uint8Array(bech32m.fromWords(decodeAddress.words));
};

export const isPenumbraAddr = (
  addr: string,
): addr is `${typeof PENUMBRA_BECH32_ADDRESS_PREFIX}1${string}` =>
  addr.length === PENUMBRA_BECH32_ADDRESS_LENGTH &&
  addr.startsWith(`${PENUMBRA_BECH32_ADDRESS_PREFIX}1`);
