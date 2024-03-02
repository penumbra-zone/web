import { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import { localExtStorage } from '@penumbra-zone/storage';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';

export const originAlreadyApproved = async (url: string): Promise<boolean> => {
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const connectedSites = (await localExtStorage.get('connectedSites')) ?? {};
  return Boolean(connectedSites[urlOrigin]);
};

export const approveOrigin = async ({
  origin: senderOrigin,
  tab,
  frameId,
}: chrome.runtime.MessageSender): Promise<boolean> => {
  if (!senderOrigin?.startsWith('https://') || !tab?.id || frameId)
    throw new Error('Unsupported sender');

  // parses the origin and returns a consistent format
  const urlOrigin = new URL(senderOrigin).origin;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const connectedSites = (await localExtStorage.get('connectedSites')) ?? {};
  if (typeof connectedSites[urlOrigin] === 'boolean') return Boolean(connectedSites[urlOrigin]);

  const res = await popup<OriginApproval>({
    type: PopupType.OriginApproval,
    request: {
      origin: urlOrigin,
      favIconUrl: tab.favIconUrl,
      title: tab.title,
    },
  });
  if ('error' in res)
    throw errorFromJson(res.error as JsonValue, undefined, ConnectError.from(res));

  connectedSites[urlOrigin] = res.data.attitude;
  void localExtStorage.set('connectedSites', connectedSites); // TODO: is there a race condition here?
  return Boolean(connectedSites[urlOrigin]);
};
