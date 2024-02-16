import { useCallback, useState } from 'react';
import {
  BackIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeTransition,
  Input,
} from '@penumbra-zone/ui';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';

import { useStore } from '../../../state';
import { networkSelector } from '../../../state/network';

import { QueryService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

export const ChooseEndpoint = () => {
  const navigate = usePageNav();
  const { grpcEndpoint, setGRPCEndpoint } = useStore(networkSelector);

  const [rpcInput, setRpcInput] = useState(grpcEndpoint ?? '');
  const [rpcError, setRpcError] = useState(undefined as string | undefined);
  const [rpcOriginPermission, setRpcOriginPermission] = useState(false);
  const [chainId, setChainId] = useState(undefined as string | undefined);

  const checkPermission = useCallback(() => {
    const rpcUrl = new URL(rpcInput);
    void chrome.permissions.contains({ origins: [`${rpcUrl.origin}/`] }).then(
      perm => setRpcOriginPermission(perm),
      () => setRpcOriginPermission(false),
    );
  }, [rpcInput]);

  const testRpc = useCallback(async () => {
    const testClient = createPromiseClient(
      QueryService,
      createGrpcWebTransport({ baseUrl: rpcInput }),
    );
    const testRequest = await testClient.appParameters({});
    setChainId(testRequest.appParameters?.chainId ?? '<unknown>');
    return Boolean(testRequest.appParameters?.chainId);
  }, [rpcInput]);

  const saveRpc = async () => {
    try {
      const rpcUrl = new URL(rpcInput);
      if (rpcUrl.protocol !== 'https:' && rpcUrl.host !== 'localhost')
        throw new TypeError('Must use HTTPS');
      const permission = await chrome.permissions.request({ origins: [`${rpcUrl.origin}/`] });
      if (!permission) throw new DOMException('Permission request denied', 'NotAllowedError');

      const success = await testRpc();
      setRpcOriginPermission(success);
      if (!success) throw TypeError('Endpoint did not indicate any chainId');

      await setGRPCEndpoint(rpcInput);
      setRpcError(undefined);
    } catch (e: unknown) {
      console.error('Could not use RPC endpoint', e);
      setRpcError(String(e) || 'Unknown RPC failure');
      throw e;
    }
  };

  return (
    <FadeTransition>
      <BackIcon className='float-left mb-4' onClick={() => navigate(-1)} />
      <Card className='w-[400px]' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Configure RPC endpoint</CardTitle>
          <CardDescription>
            <p>
              The extension will request permission to access the node you choose, and immediately
              make a request to confirm function.
            </p>
            <p>If you don&apos;t know what this is, the default is okay.</p>
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-6 grid gap-4'>
          <div className='flex flex-col items-center justify-center gap-2'>
            <div className='flex items-center gap-2 self-start'>
              <div className='text-base font-bold'>RPC URL</div>
              {rpcError ? <div className='italic text-red-400'>{rpcError}</div> : null}
            </div>
            <Input
              variant={rpcError ? 'error' : 'default'}
              value={rpcInput}
              onChange={e => {
                setRpcInput(e.target.value);
                setRpcError(undefined);
                void checkPermission();
              }}
              className='text-muted-foreground'
            />
          </div>
          <div className='flex flex-col gap-2'>
            <p className='font-headline text-base font-semibold'>Chain id</p>
            <div className='flex h-11 w-full items-center rounded-lg border bg-background px-3 py-2 text-muted-foreground'>
              {chainId ?? '<unknown>'}
            </div>
          </div>
          <Button
            variant={rpcOriginPermission ? 'ghost' : 'default'}
            className='mt-2'
            onClick={() => {
              void (async function () {
                await saveRpc();
              })();
            }}
          >
            Save Endpoint
          </Button>
          <Button
            variant='gradient'
            className='mt-2'
            disabled={!chainId || !rpcOriginPermission}
            onClick={() => navigate(PagePath.SET_PASSWORD)}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
