import { localExtStorage } from '../storage/local';

export async function redirectIfNoAccount() {
  // Check for seed phrase. If none, need to create a new account.
  const seedPhrasePresent = await localExtStorage.get('encryptedSeedPhrase');
  if (!seedPhrasePresent) {
    void chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    window.close();
  }
}
