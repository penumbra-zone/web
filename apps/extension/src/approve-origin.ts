import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';
import { UserChoice } from '@penumbra-zone/types/user-choice';

export const originAlreadyApproved = async (url?: string): Promise<boolean> => {
  if (!url) return false;
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  const knownSites = await localExtStorage.get('knownSites');
  const existingRecord = knownSites.find(site => site.origin === urlOrigin);
  return existingRecord?.choice === UserChoice.Approved;
};

export const approveOrigin = async (sender?: chrome.runtime.MessageSender): Promise<UserChoice> => {
  if (sender?.id === chrome.runtime.id) return UserChoice.Approved;
  else if (!sender?.origin?.startsWith('https://') || !sender.tab?.id || sender.frameId)
    throw new Error('Unsupported sender');

  // parses the origin and returns a consistent format
  const urlOrigin = new URL(sender.origin).origin;
  const knownSites = await localExtStorage.get('knownSites');

  const siteRecords = Map.groupBy(knownSites, site => site.origin === urlOrigin);
  const irrelevant = siteRecords.get(false) ?? []; // we need to handle these in order to write back to storage
  const [existingRecord, ...extraRecords] = siteRecords.get(true) ?? [];

  if (extraRecords.length) throw new Error('Multiple records for the same origin');

  const choice = existingRecord?.choice;

  // Choice already made
  if (choice === UserChoice.Approved || choice === UserChoice.Ignored) {
    return choice;
  }

  // It's the first or repeat ask
  const popupResponse = await popup<OriginApproval>({
    type: PopupType.OriginApproval,
    request: {
      origin: urlOrigin,
      favIconUrl: sender.tab.favIconUrl,
      title: sender.tab.title,
      lastRequest: existingRecord?.date,
    },
  });

  if (popupResponse) {
    void localExtStorage.set(
      // user interacted with popup, update record
      // TODO: is there a race condition here?  if this object has been
      //       written after our initial read, we'll clobber them
      'knownSites',
      [popupResponse, ...irrelevant],
    );
  }

  return popupResponse?.choice ?? UserChoice.Denied;
};
