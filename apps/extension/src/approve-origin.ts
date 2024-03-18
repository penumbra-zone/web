import { JsonValue } from '@bufbuild/protobuf';
import { ConnectError } from '@connectrpc/connect';
import { errorFromJson } from '@connectrpc/connect/protocol-connect';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';
import Map from '@penumbra-zone/polyfills/src/Map.groupBy';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { PraxConnectionRes } from './message/prax';

export const originAlreadyApproved = async (url: string): Promise<boolean> => {
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  const knownSites = await localExtStorage.get('knownSites');
  const existingRecord = knownSites.find(site => site.origin === urlOrigin);
  return existingRecord?.choice === UserChoice.Approved;
};

export const approveOrigin = async ({
  origin: senderOrigin,
  tab,
  frameId,
}: chrome.runtime.MessageSender): Promise<PraxConnectionRes> => {
  if (!senderOrigin?.startsWith('https://') || !tab?.id || frameId) {
    throw new Error('Unsupported sender');
  }

  const loggedIn = await sessionExtStorage.get('passwordKey');
  if (!loggedIn) {
    return PraxConnectionRes.NotLoggedIn;
  }

  // parses the origin and returns a consistent format
  const urlOrigin = new URL(senderOrigin).origin;
  const knownSites = await localExtStorage.get('knownSites');

  const siteRecords = Map.groupBy(knownSites, site => site.origin === urlOrigin);
  const irrelevant = siteRecords.get(false) ?? []; // we need to handle these in order to write back to storage
  const [existingRecord, ...extraRecords] = siteRecords.get(true) ?? [];

  if (extraRecords.length) throw new Error('Multiple records for the same origin');

  switch (existingRecord?.choice) {
    case UserChoice.Approved:
      return PraxConnectionRes.Approved;
    case UserChoice.Ignored:
      return PraxConnectionRes.Denied;
    case UserChoice.Denied:
    default: {
      const res = await popup<OriginApproval>({
        type: PopupType.OriginApproval,
        request: {
          origin: urlOrigin,
          favIconUrl: tab.favIconUrl,
          title: tab.title,
          lastRequest: existingRecord?.date,
        },
      });

      if ('error' in res) {
        throw errorFromJson(res.error as JsonValue, undefined, ConnectError.from(res));
      } else if (res.data != null) {
        // TODO: is there a race condition here?
        // if something has written after our initial read, we'll clobber them
        void localExtStorage.set('knownSites', [
          {
            ...res.data,
            date: Date.now(),
          },
          ...irrelevant,
        ]);
      }

      return res.data?.choice === UserChoice.Approved
        ? PraxConnectionRes.Approved
        : PraxConnectionRes.Denied;
    }
  }
};
