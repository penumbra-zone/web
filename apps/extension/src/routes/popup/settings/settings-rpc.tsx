import { AppQuerier } from 'penumbra-query/src/queriers/app';
import { useState } from 'react';
import { Button, FadeTransition, Input, InputProps } from 'ui';
import { cn } from 'ui/lib/utils';
import { useChainId } from '../../../hooks/chain-id';
import { ShareGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { networkSelector } from '../../../state/network';
import { swClient } from '../../service-worker/extension/client/internal';

export const SettingsRPC = () => {
  const { chainId, refetch } = useChainId();
  const { grpcEndpoint, setGRPCEndpoint } = useStore(networkSelector);

  const [rpc, setRpc] = useState(grpcEndpoint ?? '');
  const [rpcError, setRpcError] = useState(false);

  const onChange: InputProps['onChange'] = e => {
    setRpc(e.target.value);

    void (async () => {
      const querier = new AppQuerier({ grpcEndpoint: e.target.value });

      try {
        await querier.chainParams();
        setRpcError(false);
      } catch {
        setRpcError(true);
      }
    })();
  };
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='RPC' />
        <div className='mx-auto h-20 w-20'>
          <ShareGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={e => {
            e.preventDefault();
            void (async () => {
              await setGRPCEndpoint(rpc);
              await swClient.clearCache();
              await refetch();
            })();
          }}
        >
          <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <p className='font-headline text-base font-semibold'>Chain id</p>
              <Input readOnly value={chainId} className='text-muted-foreground' />
            </div>
            <div className='flex flex-col items-center justify-center gap-2'>
              <div className='flex items-center gap-2 self-start'>
                <div className='text-base font-bold'>RPC URL</div>
                {rpcError ? (
                  <div className={cn('italic', 'text-red-400')}>
                    Failed to get response from rpc
                  </div>
                ) : null}
              </div>
              <Input
                variant={rpcError ? 'error' : 'default'}
                value={rpc}
                onChange={onChange}
                className='text-muted-foreground'
              />
            </div>
          </div>
          <Button
            variant='gradient'
            size='lg'
            className='w-full'
            type='submit'
            disabled={rpc === grpcEndpoint || rpcError}
          >
            Save
          </Button>
        </form>
      </div>
    </FadeTransition>
  );
};
