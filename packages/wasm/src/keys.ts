import {
  generate_spend_key,
  get_address_by_index,
  get_ephemeral_address,
  get_full_viewing_key,
  get_wallet_id,
} from '../wasm';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const generateSpendKey = (seedPhrase: string) => generate_spend_key(seedPhrase);

export const getFullViewingKey = (spendKey: string) => get_full_viewing_key(spendKey);

export const getAddressByIndex = (fullViewingKey: string, index: number) => {
  const bytes = get_address_by_index(fullViewingKey, index);
  return Address.fromBinary(bytes);
};

export const getEphemeralByIndex = (fullViewingKey: string, index: number) => {
  const bytes = get_ephemeral_address(fullViewingKey, index);
  return Address.fromBinary(bytes);
};

export const getWalletId = (fullViewingKey: string) => get_wallet_id(fullViewingKey);
