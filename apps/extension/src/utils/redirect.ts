// import { localExtStorage } from '../storage/local';

export const redirectIfNoAccount = async () => {
  // Check for seed phrase. If none, need to create a new account.
  // const seedPhrasePresent = await localExtStorage.get('encryptedSeedPhrase');
  // if (!seedPhrasePresent) {
  await chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
  window.close();
  // }
};
