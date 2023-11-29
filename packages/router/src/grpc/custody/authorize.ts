import { GrpcRequest } from '@penumbra-zone/transport';
import { Box } from '@penumbra-zone/types';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import {
  AuthorizeRequest,
  AuthorizeResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { authorizePlan, generateSpendKey } from '@penumbra-zone/wasm-ts';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { Key } from '@penumbra-zone/crypto-web';

export const isAuthorizeRequest = (
  req: GrpcRequest<typeof CustodyProtocolService>,
): req is AuthorizeRequest => {
  return req.getType().typeName === AuthorizeRequest.typeName;
};

export const interactiveApproval = async (req: AuthorizeRequest): Promise<boolean> => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  console.log('tab', tab);
  const approvalRequest = {
    type: 'popup-approval-request', // put this type somewhere idk
    pending: JSON.stringify(req),
  };
  await chrome.action.setPopup({ tabId: tab!.id, popup: 'popup.html#/approval' }); // choose popup location. this is broken because react
  await chrome.action.openPopup({ windowId: tab!.windowId }); // open on specific window
  await new Promise(resolve => {
    setTimeout(resolve, 500); // this is stupid but we have to wait for react to navigate to the page and stop discarding state
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const approvalResponse: { attitude: boolean } = await chrome.runtime.sendMessage(approvalRequest);
  return approvalResponse.attitude;
};

export const handleAuthorizeReq = async (req: AuthorizeRequest): Promise<AuthorizeResponse> => {
  // enter interactive approval
  const interative = await interactiveApproval(req);
  console.log('interative approval', interative);

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
