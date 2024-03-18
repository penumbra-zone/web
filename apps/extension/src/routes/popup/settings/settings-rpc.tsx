import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';
import { FormEvent, useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { ShareGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared/components/settings-header';
import { useStore } from '../../../state';
import { networkSelector } from '../../../state/network';
import '@penumbra-zone/polyfills/src/Promise.withResolvers';
import { TrashIcon } from '@radix-ui/react-icons';
import { ServicesMessage } from '@penumbra-zone/types/src/services';

export const SettingsRPC = () => {
  const { chainId: currentChainId } = useChainIdQuery();
  const [newChainId, setNewChainId] = useState<string>();
  const { grpcEndpoint, setGRPCEndpoint } = useStore(networkSelector);

  const [rpcInput, setRpcInput] = useState<string>(grpcEndpoint ?? '');
  const [rpcError, setRpcError] = useState<string>();
  const [countdownTime, setCountdownTime] = useState<number>();

  const countdown = (seconds: number) => {
    const { promise, resolve } = Promise.withResolvers();
    setCountdownTime(seconds);
    setInterval(() => {
      if (!seconds) resolve(undefined);
      setCountdownTime(--seconds);
    }, 1000);
    return promise;
  };

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    void (async () => {
      try {
        const trialClient = createPromiseClient(
          QueryService,
          createGrpcWebTransport({ baseUrl: rpcInput }),
        );
        const { appParameters } = await trialClient.appParameters({});
        if (!appParameters?.chainId) throw new Error('Endpoint did not provide a valid chainId');

        setRpcError(undefined);
        setNewChainId(appParameters.chainId);
        await setGRPCEndpoint(rpcInput);
        // If the chain id has changed, our cache is invalid
        if (appParameters.chainId !== currentChainId)
          void chrome.runtime.sendMessage(ServicesMessage.ClearCache);
        // Visually confirm success for a few seconds
        await countdown(5);
        // Reload the extension to ensure all scopes holding the old config are killed
        chrome.runtime.reload();
      } catch (e: unknown) {
        console.warn('Could not use new RPC endpoint', e);
        setRpcError(String(e) || 'Unknown RPC failure');
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title='RPC' />
        <div className='mx-auto size-20'>
          <ShareGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={onSubmit}
        >
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='flex items-center gap-2 self-start'>
                <div className='text-base font-bold'>RPC URL</div>
                {rpcError ? <div className='italic text-red-400'>{rpcError}</div> : null}
              </div>
              <div className='relative w-full'>
                <div className='absolute inset-y-0 right-4 flex cursor-pointer items-center'>
                  {rpcInput !== grpcEndpoint ? (
                    <Button
                      type='reset'
                      variant='outline'
                      onClick={() => setRpcInput(grpcEndpoint ?? DEFAULT_GRPC_URL)}
                    >
                      <TrashIcon />
                    </Button>
                  ) : null}
                </div>
                <Input
                  variant={rpcError ? 'error' : rpcInput !== grpcEndpoint ? 'warn' : 'default'}
                  value={rpcInput}
                  onChange={evt => {
                    setRpcError(undefined);
                    setRpcInput(evt.target.value);
                  }}
                  className='text-muted-foreground'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Chain id</p>
              <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                {newChainId ?? currentChainId}
              </div>
            </div>
          </div>
          {countdownTime !== undefined ? (
            <Button disabled variant='outline' size='lg' className='w-full'>
              Saved! Restarting in {countdownTime}...
            </Button>
          ) : (
            <Button
              variant={rpcInput !== grpcEndpoint ? 'gradient' : 'outline'}
              size='lg'
              className='w-full'
              type='submit'
            >
              Save
            </Button>
          )}
        </form>
      </div>
    </FadeTransition>
  );
};
