import {
  generate_spend_key,
  get_address_by_index,
  get_ephemeral_address,
  get_full_viewing_key,
  get_wallet_id,
} from '../wasm';
import {
  Address,
  FullViewingKey,
  SpendKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const generateSpendKey = (seedPhrase: string) =>
  SpendKey.fromBinary(generate_spend_key(seedPhrase));

export const getFullViewingKey = (spendKey: SpendKey) =>
  FullViewingKey.fromBinary(get_full_viewing_key(spendKey.toBinary()));

export const getAddressByIndex = (fullViewingKey: FullViewingKey, index: number) =>
  Address.fromBinary(get_address_by_index(fullViewingKey.toBinary(), index));

export const getEphemeralByIndex = (fullViewingKey: FullViewingKey, index: number) =>
  Address.fromBinary(get_ephemeral_address(fullViewingKey.toBinary(), index));

export const getWalletId = (fullViewingKey: FullViewingKey) =>
  WalletId.fromBinary(get_wallet_id(fullViewingKey.toBinary()));
