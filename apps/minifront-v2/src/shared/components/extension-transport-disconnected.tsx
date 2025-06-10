import { FallbackPage } from './fallback-page';

export const ExtensionTransportDisconnected = () => {
  return (
    <FallbackPage
      title='Connection Lost'
      description='The connection to your wallet has been lost. Please make sure your wallet extension is running and try reloading the page.'
      buttonText='Reload Page'
      onButtonClick={() => window.location.reload()}
    />
  );
};
