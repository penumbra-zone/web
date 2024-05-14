chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL)
    void import('./install/onboard').then(({ onboard }) => onboard(details.previousVersion));
  else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE)
    void import('./install/migrate').then(({ migrate }) => migrate(details.previousVersion));
});
