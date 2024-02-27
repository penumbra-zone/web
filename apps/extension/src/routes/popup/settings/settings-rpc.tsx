import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';
import { FormEvent, useState } from 'react';
import { Button, FadeTransition, Input } from '@penumbra-zone/ui';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { ShareGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { networkSelector } from '../../../state/network';
import { internalSwClient } from '@penumbra-zone/router';
import '@penumbra-zone/types/src/promise-with-resolvers';

export const SettingsRPC = () => {
  const { chainId: currentChainId } = useChainIdQuery();
  const [newChainId, setNewChainId] = useState(undefined as string | undefined);
  const { grpcEndpoint, setGRPCEndpoint } = useStore(networkSelector);

  const [rpcInput, setRpcInput] = useState(grpcEndpoint ?? '');
  const [rpcError, setRpcError] = useState(undefined as string | undefined);
  const [countdownTime, setCountdownTime] = useState(undefined as number | undefined);

  const countdown = (seconds: number) => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
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
        const { appParameters } = await createPromiseClient(
          QueryService,
          createGrpcWebTransport({ baseUrl: rpcInput }),
        ).appParameters({});
        if (!appParameters?.chainId) throw new Error('Endpoint did not provide a valid chainId');

        setRpcError(undefined);
        setNewChainId(appParameters.chainId);
        await setGRPCEndpoint(rpcInput);
        // TODO: show dialog, explain new chain
        if (appParameters.chainId != currentChainId) void internalSwClient.clearCache();
        await countdown(5).then(() => chrome.runtime.reload());
      } catch (e: unknown) {
        console.error('Could not use RPC endpoint', e);
        setRpcError(String(e) || 'Unknown RPC failure');
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
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
              <Input
                variant={rpcError ? 'error' : 'default'}
                value={rpcInput}
                onChange={evt => {
                  setRpcError(undefined);
                  setRpcInput(evt.target.value);
                }}
                className='text-muted-foreground'
              />
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Chain id</p>
              <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                {newChainId ?? currentChainId}
              </div>
            </div>
          </div>
          {countdownTime != null ? (
            <Button disabled variant='outline' size='lg' className='w-full'>
              Saved! Restarting in {countdownTime}...
            </Button>
          ) : (
            <Button variant='gradient' size='lg' className='w-full' type='submit'>
              Save
            </Button>
          )}
        </form>
      </div>
    </FadeTransition>
  );
};
