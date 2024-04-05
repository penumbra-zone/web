import { useState } from 'react';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { ShareGradientIcon } from '../../../icons/share-gradient';
import { SettingsHeader } from '../../../shared/components/settings-header';
import '@penumbra-zone/polyfills/src/Promise.withResolvers';
import { GrpcEndpointForm } from '../../../shared/components/grpc-endpoint-form';
import { PaddingWrapper } from '../padding-wrapper';

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
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title='RPC' />
        <div className='mx-auto size-20'>
          <ShareGradientIcon />
        </div>

        <PaddingWrapper>
          <GrpcEndpointForm submitButtonLabel={submitButtonLabel} onSuccess={onSuccess} />
        </PaddingWrapper>
      </div>
    </FadeTransition>
  );
};
