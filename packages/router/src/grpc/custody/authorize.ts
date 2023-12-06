import { Box } from '@penumbra-zone/types';
import {
  AuthorizeRequest,
  AuthorizeResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { authorizePlan, generateSpendKey } from '@penumbra-zone/wasm-ts';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { Key } from '@penumbra-zone/crypto-web';
import { AnyMessage } from '@bufbuild/protobuf';

export const isAuthorizeRequest = (req: AnyMessage): req is AuthorizeRequest => {
  return req.getType().typeName === AuthorizeRequest.typeName;
};

export const handleAuthorizeReq = async (req: AuthorizeRequest): Promise<AuthorizeResponse> => {
  if (!req.plan) throw new Error('No plan included in request');

  const passwordKey = await sessionExtStorage.get('passwordKey');
  if (!passwordKey) throw new Error('User must login to extension');

  const wallets = await localExtStorage.get('wallets');
  const { encryptedSeedPhrase } = wallets[0]!.custody;

  const key = await Key.fromJson(passwordKey);
  const decryptedSeedPhrase = await key.unseal(Box.fromJson(encryptedSeedPhrase));
  if (!decryptedSeedPhrase) throw new Error('Unable to decrypt seed phrase with password');

  const spendKey = generateSpendKey(decryptedSeedPhrase);

  const authorizationData = authorizePlan(spendKey, req.plan);
  return new AuthorizeResponse({ data: authorizationData });
};
