import { Code, ConnectError } from '@connectrpc/connect';
import { Key } from '@penumbra-zone/crypto-web/encryption';
import { localExtStorage } from '../storage/local';
import { sessionExtStorage } from '../storage/session';
import { Box } from '@penumbra-zone/types/box';
import { generateSpendKey } from '@penumbra-zone/wasm/keys';

export const getSpendKey = async () => {
  const passKeyJson = await sessionExtStorage.get('passwordKey');
  if (!passKeyJson) throw new ConnectError('User must login', Code.Unauthenticated);
  const passKey = await Key.fromJson(passKeyJson);

  const wallet0 = (await localExtStorage.get('wallets'))[0];
  if (!wallet0) throw new ConnectError('No wallet found');

  const seedBox = Box.fromJson(wallet0.custody.encryptedSeedPhrase);
  const seedPhrase = await passKey.unseal(seedBox);
  if (!seedPhrase) throw new ConnectError('Unable to decrypt seed phrase', Code.Unauthenticated);

  return generateSpendKey(seedPhrase);
};
