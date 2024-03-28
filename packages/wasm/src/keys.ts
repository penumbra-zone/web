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
import { JsonValue } from '@bufbuild/protobuf';

export const generateSpendKey = (seedPhrase: string) =>
  SpendKey.fromJson(generate_spend_key(seedPhrase) as JsonValue);

export const getFullViewingKey = (spendKey: SpendKey) =>
  FullViewingKey.fromJson(get_full_viewing_key(spendKey.toJson()) as JsonValue);

export const getAddressByIndex = (fullViewingKey: FullViewingKey, index: number) =>
  Address.fromJson(get_address_by_index(fullViewingKey.toJson(), index) as JsonValue);

export const getEphemeralByIndex = (fullViewingKey: FullViewingKey, index: number) =>
  Address.fromJson(get_ephemeral_address(fullViewingKey.toJson(), index) as JsonValue);

export const getWalletId = (fullViewingKey: FullViewingKey) =>
  WalletId.fromJson(get_wallet_id(fullViewingKey) as JsonValue);
