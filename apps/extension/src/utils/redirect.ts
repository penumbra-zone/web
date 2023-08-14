import { localExtStorage } from '../storage/local';

// Users without any accounts setup, need to be directed to the onboarding flow.
// Because Zustand initializes default empty (prior to persisted storage synced),
// the useAccessCheck() hook believes it needs to re-direct immediately.
// Therefore, this redirect function is necessary to be used in `popup.tsx`.
export const redirectIfNoAccount = async () => {
  const accounts = await localExtStorage.get('accounts');
  if (!accounts.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    window.close();
  }
};
