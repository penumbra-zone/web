//import { FullViewingKey, WalletId, } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Wallet, WalletJson, walletsFromJson } from '@penumbra-zone/types/wallet';

// technically, local['wallets'] is an array, but we only ever use wallet0.
// eventually we should support multiple wallets

const wallets = async (): Promise<Wallet[]> => {
  const { wallets = [] } = await chrome.storage.local.get('wallets');
  if (!Array.isArray(wallets)) throw new TypeError();
  return walletsFromJson(wallets as WalletJson[]);
};

export const wallet = async (idx = 0): Promise<Wallet> => {
  const wallet = (await wallets())[idx];
  if (!wallet) throw new Error(`Wallet ${idx} not found`);
  return wallet;
};

/*
export const fullViewingKey = () =>
  wallet().then(({ fullViewingKey }) => FullViewingKey.fromJsonString(fullViewingKey));

export const walletId = () => wallet().then(({ id }) => WalletId.fromJsonString(id));

export const encryptedSeedPhrase = () =>
  wallet().then(({ custody: { encryptedSeedPhrase } }) => encryptedSeedPhrase);
*/
