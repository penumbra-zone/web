import { Code, ConnectError } from '@connectrpc/connect';
import { Key } from '@penumbra-zone/crypto-web/encryption';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { sessionExtStorage } from '@penumbra-zone/storage/chrome/session';
import { Box } from '@penumbra-zone/types/box';
import { generateSpendKey } from '@penumbra-zone/wasm/keys';

export const getSpendKey = async () => {
  const pk = await sessionExtStorage.get('passwordKey');
  if (!pk) throw new ConnectError('User must login to extension', Code.Unauthenticated);

  const wallet0 = (await localExtStorage.get('wallets'))[0];
  if (!wallet0) throw new ConnectError('No wallet found', Code.FailedPrecondition);

  const decryptedSeedPhrase = await (
    await Key.fromJson(pk)
  ).unseal(Box.fromJson(wallet0.custody.encryptedSeedPhrase));

  if (!decryptedSeedPhrase)
    throw new ConnectError('Unable to decrypt seed phrase', Code.Unauthenticated);

  return generateSpendKey(decryptedSeedPhrase);
};
