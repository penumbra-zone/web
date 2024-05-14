export const onboard = async (previousVersion?: string) => {
  console.warn('onboarding with previous version: ', previousVersion);
  const { openedOnboarding } = await chrome.storage.session.get('openedOnboarding');
  if (openedOnboarding) return;
  void chrome.storage.session.set({ openedOnboarding: true });
  void chrome.runtime.openOptionsPage();
};
