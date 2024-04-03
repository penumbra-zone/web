import { FormEvent, useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { ShareGradientIcon } from '../../../icons/share-gradient';
import { SettingsHeader } from '../../../shared/components/settings-header';
import '@penumbra-zone/polyfills/src/Promise.withResolvers';
import { TrashIcon } from '@radix-ui/react-icons';
import { useGrpcEndpointForm } from '../../../hooks/use-grpc-endpoint-form';

export const SettingsRPC = () => {
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

  const onSuccess = async () => {
    // Visually confirm success for a few seconds
    await countdown(5);
    // Reload the extension to ensure all scopes holding the old config are killed
    chrome.runtime.reload();
  };

  const {
    onSubmit,
    chainId,
    grpcEndpoint,
    rpcError,
    setRpcError,
    grpcEndpointInput,
    setGrpcEndpointInput,
  } = useGrpcEndpointForm();

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    void onSubmit(onSuccess);
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
          onSubmit={handleSubmit}
        >
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='flex items-center gap-2 self-start'>
                <div className='text-base font-bold'>RPC URL</div>
                {rpcError ? <div className='italic text-red-400'>{rpcError}</div> : null}
              </div>
              <div className='relative w-full'>
                <div className='absolute inset-y-0 right-4 flex cursor-pointer items-center'>
                  {grpcEndpointInput !== grpcEndpoint ? (
                    <Button
                      type='reset'
                      variant='outline'
                      onClick={() => setGrpcEndpointInput(grpcEndpoint ?? DEFAULT_GRPC_URL)}
                    >
                      <TrashIcon />
                    </Button>
                  ) : null}
                </div>
                <Input
                  variant={
                    rpcError ? 'error' : grpcEndpointInput !== grpcEndpoint ? 'warn' : 'default'
                  }
                  value={grpcEndpointInput}
                  onChange={evt => {
                    setRpcError(undefined);
                    setGrpcEndpointInput(evt.target.value);
                  }}
                  className='text-muted-foreground'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Chain id</p>
              <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
                {chainId}
              </div>
            </div>
          </div>
          {countdownTime !== undefined ? (
            <Button disabled variant='outline' size='lg' className='w-full'>
              Saved! Restarting in {countdownTime}...
            </Button>
          ) : (
            <Button
              variant={grpcEndpointInput !== grpcEndpoint ? 'gradient' : 'outline'}
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
