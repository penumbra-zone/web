import { localExtStorage } from '../storage/local';

export const redirectIfNoAccount = async () => {
  // Check for seed phrase. If none, need to create a new account.
  // needs to be first, not until zustand checks it given zustand store initialized with zero
  const accounts = await localExtStorage.get('accounts');
  if (!accounts.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    window.close();
  }
};
