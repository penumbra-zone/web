import { useState } from 'react';
import { ShareGradientIcon } from '../../../icons/share-gradient';
import { GrpcEndpointForm } from '../../../shared/components/grpc-endpoint-form';
import { SettingsScreen } from './settings-screen';
import '@penumbra-zone/polyfills/src/Promise.withResolvers';

export const SettingsRPC = () => {
  const [countdownTime, setCountdownTime] = useState<number>();
  const submitButtonLabel =
    Number(countdownTime) > 0 ? `Saved! Restarting in ${countdownTime}...` : 'Save';

  const countdown = (seconds: number) => {
    const { promise, resolve } = Promise.withResolvers();
    setCountdownTime(seconds);
    setInterval(() => {
      if (!seconds) resolve(undefined);
      setCountdownTime(--seconds);
    }, 1000);
    return promise;
  };

  const onSuccess = async () => {
    // Visually confirm success for a few seconds, then reload the extension to
    // ensure all scopes holding the old config are killed
    await countdown(5);
    chrome.runtime.reload();
  };

  return (
    <SettingsScreen title='RPC' IconComponent={ShareGradientIcon}>
      <GrpcEndpointForm submitButtonLabel={submitButtonLabel} onSuccess={onSuccess} />
    </SettingsScreen>
  );
};
