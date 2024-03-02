import { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import { OriginRecord, localExtStorage } from '@penumbra-zone/storage';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';
import Map from '@penumbra-zone/polyfills/Map.groupBy';

export const originAlreadyApproved = async (url: string): Promise<boolean> => {
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const connectedSites = await localExtStorage.get('connectedSites');
  return Boolean(connectedSites.find(site => site.origin === urlOrigin)?.attitude);
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
  const connectedSites = await localExtStorage.get('connectedSites');

  const siteRecords = Map.groupBy(connectedSites, site => site.origin === urlOrigin);
  const irrelevant = siteRecords.get(false) ?? []; // we need to handle these in order to write back to storage
  const [existingRecord, ...extraRecords] = siteRecords.get(true) ?? [];

  if (extraRecords.length) throw new Error('Multiple records for the same origin');
  if (existingRecord) return Boolean(existingRecord.attitude);

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

  const createRecord: OriginRecord = {
    ...res.data,
    date: Date.now(),
  };

  // TODO: is there a race condition here?
  // if something has written after our initial read, we'll clobber them
  void localExtStorage.set('connectedSites', [createRecord, ...irrelevant]);

  return Boolean(createRecord.attitude);
};
