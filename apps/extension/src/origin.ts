import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { OriginApproval, PopupType } from './message/popup';
import { popup } from './popup';
import { UserChoice } from '@penumbra-zone/types/user-choice';

export const originAlreadyApproved = async (url: string): Promise<boolean> => {
  // parses the origin and returns a consistent format
  const urlOrigin = new URL(url).origin;
  const knownSites = await localExtStorage.get('knownSites');
  const existingRecord = knownSites.find(site => site.origin === urlOrigin);
  return existingRecord?.choice === UserChoice.Approved;
};

export const removeOrigin = async (sender: chrome.runtime.MessageSender): Promise<void> => {
  // parses the origin and returns a consistent format
  const { origin: senderOrigin } = sender;

  if (!senderOrigin) {
    console.warn('No record for origin', sender);
    return;
  }

  const urlOrigin = new URL(senderOrigin).origin;
  const knownSites = await localExtStorage.get('knownSites');
  const sansDeletant = knownSites.filter(site => site.origin !== urlOrigin);

  if (sansDeletant.length === knownSites.length) {
    console.warn('No site record found:', urlOrigin);
    return;
  }

  if (!sansDeletant.length) console.warn('No site records remaining:', sansDeletant);

  void localExtStorage.set('knownSites', sansDeletant);
};

export const approveOrigin = async ({
  origin: senderOrigin,
  tab,
  frameId,
}: chrome.runtime.MessageSender): Promise<UserChoice> => {
  if (!senderOrigin?.startsWith('https://') || !tab?.id || frameId)
    throw new Error('Unsupported sender');

  // parses the origin and returns a consistent format
  const urlOrigin = new URL(senderOrigin).origin;
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
      favIconUrl: tab.favIconUrl,
      title: tab.title,
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
