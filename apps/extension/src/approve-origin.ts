import { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import { localExtStorage } from '@penumbra-zone/storage';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';
import Map from '@penumbra-zone/polyfills/Map.groupBy';
import { UserAttitude } from '@penumbra-zone/types/src/user-attitude';

export const originAlreadyApproved = async (url: string): Promise<boolean> => {
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  const knownSites = await localExtStorage.get('knownSites');
  const existingRecord = knownSites.find(site => site.origin === urlOrigin);
  return existingRecord?.attitude === UserAttitude.Approved;
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
  const knownSites = await localExtStorage.get('knownSites');

  const siteRecords = Map.groupBy(knownSites, site => site.origin === urlOrigin);
  const irrelevant = siteRecords.get(false) ?? []; // we need to handle these in order to write back to storage
  const [existingRecord, ...extraRecords] = siteRecords.get(true) ?? [];

  if (extraRecords.length) throw new Error('Multiple records for the same origin');

  switch (existingRecord?.attitude) {
    case UserAttitude.Approved:
      return true;
    case UserAttitude.Ignored:
      return false;
    case UserAttitude.Denied: // TODO: cooldown on re-request
    default: {
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

      // TODO: is there a race condition here?
      // if something has written after our initial read, we'll clobber them
      void localExtStorage.set('knownSites', [
        {
          ...res.data,
          date: Date.now(),
        },
        ...irrelevant,
      ]);

      return Boolean(res.data.attitude === UserAttitude.Approved);
    }
  }
};
