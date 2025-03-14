import {
  generate_spend_key,
  get_address_by_index,
  get_ephemeral_address,
  get_full_viewing_key,
  get_noble_forwarding_addr,
  get_transparent_address,
  get_transmission_key_by_address,
  get_wallet_id,
} from '../wasm/index.js';
import { fromBinary, toBinary } from '@bufbuild/protobuf';
import {
  AddressSchema,
  FullViewingKeySchema,
  SpendKeySchema,
  WalletIdSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import type {
  Address,
  FullViewingKey,
  SpendKey,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export const generateSpendKey = (seedPhrase: string) =>
  fromBinary(SpendKeySchema, generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: SpendKey) =>
  fromBinary(FullViewingKeySchema, get_full_viewing_key(toBinary(SpendKeySchema, spendKey)));

export const getAddressByIndex = (fullViewingKey: FullViewingKey, index: number) => {
  const bytes = get_address_by_index(toBinary(FullViewingKeySchema, fullViewingKey), index);
  return fromBinary(AddressSchema, bytes);
};

export const getEphemeralByIndex = (fullViewingKey: FullViewingKey, index: number) => {
  const bytes = get_ephemeral_address(toBinary(FullViewingKeySchema, fullViewingKey), index);
  return fromBinary(AddressSchema, bytes);
};

export const getWalletId = (fullViewingKey: FullViewingKey) =>
  fromBinary(WalletIdSchema, get_wallet_id(toBinary(FullViewingKeySchema, fullViewingKey)));

export interface NobleAddrResponse {
  // A noble address that will be used for registration on the noble network
  nobleAddrBech32: string;
  // Byte representation of the noble forwarding address. Used for broadcasting cosmos message.
  nobleAddrBytes: Uint8Array;
  // The penumbra address that a deposit to the noble address with forward to
  penumbraAddr: Address;
}

// Generates an address that can be used as a forwarding address for Noble
export const getNobleForwardingAddr = (
  sequence: number,
  fvk: FullViewingKey,
  channel: string,
  account?: number,
): NobleAddrResponse => {
  const res = get_noble_forwarding_addr(
    sequence,
    toBinary(FullViewingKeySchema, fvk),
    channel,
    account,
  );
  return {
    nobleAddrBech32: res.noble_addr_bech32,
    nobleAddrBytes: res.noble_addr_bytes,
    penumbraAddr: fromBinary(AddressSchema, res.penumbra_addr_bytes),
  };
};

// Generates a transparent address that ensures bech32m encoding compatibility.
export const getTransparentAddress = (fvk: FullViewingKey) => {
  const res = get_transparent_address(toBinary(FullViewingKeySchema, fvk));
  return {
    address: fromBinary(AddressSchema, res.address),
    encoding: res.encoding,
  };
};

export const getTransmissionKeyByAddress = (address: Address) => {
  const transmission_key = get_transmission_key_by_address(toBinary(AddressSchema, address));
  return transmission_key;
};
