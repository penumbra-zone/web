import { UserChoice } from '@penumbra-zone/types/user-choice';
import { isOriginRecord, OriginRecord } from '../types';

const defaultKnownSites = [
  { origin: new URL(DEFAULT_FRONTEND_URL).origin, choice: UserChoice.Approved, date: 0 },
];

export const allKnownSites = async (): Promise<OriginRecord[]> => {
  const { knownSites } = await chrome.storage.local.get('knownSites');
  if (!Array.isArray(knownSites)) return defaultKnownSites;

  if (!knownSites.every(isOriginRecord))
    console.warn(
      'chrome.storage.local/knownSites contains invalid data',
      knownSites.filter(site => !isOriginRecord(site)),
    );

  return knownSites.filter(isOriginRecord);
};

export const addKnownSite = async (
  { origin: addOrigin }: URL,
  addChoice: string & UserChoice,
): Promise<void> => {
  const knownSites = (await allKnownSites()).filter(storedSite => storedSite.origin !== addOrigin);
  knownSites.push({
    origin: addOrigin,
    choice: addChoice,
    date: Date.now(),
  });

  return chrome.storage.local.set({
    knownSites,
  });
};

export const removeKnownSite = async ({ origin: removeOrigin }: URL): Promise<void> =>
  chrome.storage.local.set({
    knownSites: (await allKnownSites()).filter(storedSite => storedSite.origin !== removeOrigin),
  });

export const knownSiteAttitude = async ({
  origin: getOrigin,
}: URL): Promise<UserChoice | undefined> =>
  (await allKnownSites()).find(site => site.origin === getOrigin)?.choice;
