import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32m } from 'bech32';

// Globally set Bech32 prefix used for addresses
const BECH32_PREFIX = 'penumbra';
const ADDRESS_LENGTH = 143;

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const bech32Address = (addr: Address): string => {
  return bech32m.encode(BECH32_PREFIX, bech32m.toWords(addr.inner), 160);
};

export const isPenumbraAddr = (addr: string): boolean =>
  addr.length === ADDRESS_LENGTH && addr.startsWith(BECH32_PREFIX);
