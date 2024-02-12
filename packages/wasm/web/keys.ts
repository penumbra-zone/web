import {
  generate_spend_key,
  get_address_by_index,
  get_ephemeral_address,
  get_full_viewing_key,
  get_wallet_id,
} from '../crate/pkg';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { JsonValue } from '@bufbuild/protobuf';

export const generateSpendKey = (seedPhrase: string) => generate_spend_key(seedPhrase) as string;

export const getFullViewingKey = (spendKey: string) => get_full_viewing_key(spendKey) as string;

export const getAddressByIndex = (fullViewingKey: string, index: number) =>
  Address.fromJson(get_address_by_index(fullViewingKey, index) as JsonValue);

export const getEphemeralByIndex = (fullViewingKey: string, index: number) =>
  Address.fromJson(get_ephemeral_address(fullViewingKey, index) as JsonValue);

export const getWalletId = (fullViewingKey: string) => get_wallet_id(fullViewingKey);
