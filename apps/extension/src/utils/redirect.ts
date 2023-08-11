import { localExtStorage } from '../storage/local';

export async function redirectIfNoAccount() {
  // Check for seed phrase. If none, need to create a new account.
  // should be .length-able
  const bears = await localExtStorage.get('bears');
  if (bears < 1) {
    void chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    window.close();
  }
}
