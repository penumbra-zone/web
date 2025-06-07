import { FallbackPage } from './fallback-page';

const CHROME_EXTENSION_ID = 'lkpmkhpnhknhmibgnmmhdhgdilepfghe';

export const ExtensionNotInstalled = () => {
  const openInstallPage = () => {
    window.open(
      `https://chrome.google.com/webstore/detail/penumbra-wallet/${CHROME_EXTENSION_ID}`,
      '_blank',
      'noreferrer',
    );
  };

  return (
    <FallbackPage
      title='Welcome to Penumbra'
      description='To get started, install Prax, the default Penumbra wallet in your browser.'
      buttonText='Install Prax'
      onButtonClick={openInstallPage}
    />
  );
};
