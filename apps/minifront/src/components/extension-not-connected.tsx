import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@penumbra-zone/ui/Dialog';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Toaster } from '@penumbra-zone/ui/components/ui/toaster';
import { SplashPage } from '@penumbra-zone/ui/components/ui/splash-page';
import { errorToast, warningToast } from '@penumbra-zone/ui/lib/toast/presets';
import {
  PenumbraRequestFailure,
  PenumbraClient,
  PenumbraManifest,
  PenumbraNotInstalledError,
} from '@penumbra-zone/client';

import { penumbra } from '../penumbra.ts';
import { HeadTag } from './metadata/head-tag';
import { LoadingIndicator } from './shared/selectors/loading-indicator';

const handleErr = (e: unknown) => {
  if (e instanceof Error && e.cause) {
    switch (e.cause) {
      case PenumbraRequestFailure.Denied:
        errorToast(
          'You may need to un-ignore this site in your extension settings.',
          'Connection denied',
        ).render();
        break;
      case PenumbraRequestFailure.NeedsLogin:
        warningToast(
          'Not logged in',
          'Please login into the extension and reload the page',
        ).render();
        break;
      default:
        errorToast(e, 'Connection error').render();
    }
  } else {
    console.warn('Unknown connection failure', e);
    errorToast(e, 'Unknown connection failure').render();
  }
};

export const ExtensionNotConnected = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<boolean>();
  const navigate = useNavigate();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['provider-manifests'],
    queryFn: async () => {
      const providers = PenumbraClient.getProviderManifests();
      const resolvedManifests = await Promise.all(
        Object.entries(providers).map(async ([key, promise]) => {
          const value = await promise;
          return [key, value];
        }),
      );
      return Object.fromEntries(resolvedManifests) as Record<string, PenumbraManifest>;
    },
  });

  const connect = async (provider: string) => {
    try {
      await penumbra.connect(provider);
      navigate('/');
    } catch (e) {
      handleErr(e);
    } finally {
      setResult(true);
    }
  };

  const checkProviders = () => {
    const providers = PenumbraClient.getProviders();
    const length = Object.keys(providers).length;
    const first = Object.keys(providers)[0];

    if (length > 1) {
      setIsOpen(true);
    } else if (length === 1 && first) {
      void connect(first);
    } else {
      throw new PenumbraNotInstalledError();
    }
  };

  return (
    <>
      <HeadTag />
      <Toaster />

      <SplashPage title='Connect to Penumbra'>
        <div className='flex items-center justify-between gap-[1em] text-lg'>
          <div>To get started, connect the Penumbra Chrome extension.</div>
          {!result ? (
            <Button variant='gradient' onClick={checkProviders}>
              Connect
            </Button>
          ) : (
            <Button variant='gradient' onClick={() => location.reload()}>
              Reload
            </Button>
          )}
        </div>

        <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Dialog.Content title='Choose wallet' zIndex={9999}>
            {isLoading ? (
              <LoadingIndicator />
            ) : (
              <Dialog.RadioGroup>
                <div className='flex flex-col gap-1'>
                  {providers &&
                    Object.entries(providers).map(([key, manifest]) => (
                      <Dialog.RadioItem
                        key={key}
                        value={key}
                        title={manifest.name}
                        description={manifest.description}
                        startAdornment={
                          <img
                            height={32}
                            width={32}
                            src={URL.createObjectURL(manifest.icons['128'])}
                            alt={manifest.name}
                          />
                        }
                        onSelect={() => void connect(key)}
                      />
                    ))}
                </div>
              </Dialog.RadioGroup>
            )}
          </Dialog.Content>
        </Dialog>
      </SplashPage>
    </>
  );
};
