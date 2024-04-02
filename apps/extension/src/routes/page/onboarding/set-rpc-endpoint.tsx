import { Card, CardDescription, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { RPC_ENDPOINTS } from '../../../shared/rpc-endpoints';
import { FormEvent, useEffect, useMemo, useRef } from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { AllSlices } from '../../../state';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { ServicesMessage } from '@penumbra-zone/types/src/services';
import { Network } from 'lucide-react';

const randomSort = () => (Math.random() >= 0.5 ? 1 : -1);

const setRpcEndpointSelector = (state: AllSlices) => ({
  grpcEndpoint: state.network.grpcEndpoint,
  setGRPCEndpoint: state.network.setGRPCEndpoint,
});

export const SetRpcEndpoint = () => {
  const navigate = usePageNav();
  const randomlySortedEndpoints = useMemo(() => [...RPC_ENDPOINTS].sort(randomSort), []);
  const { grpcEndpoint, setGRPCEndpoint } = useStoreShallow(setRpcEndpointSelector);
  const customRpcEndpointInput = useRef<HTMLInputElement | null>(null);
  const isCustomRpcEndpoint = !RPC_ENDPOINTS.some(({ url }) => url === grpcEndpoint);

  useEffect(
    () => void setGRPCEndpoint(randomlySortedEndpoints[0]!.url),
    [randomlySortedEndpoints, setGRPCEndpoint],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void chrome.runtime.sendMessage(ServicesMessage.OnboardComplete);
    navigate(PagePath.ONBOARDING_SUCCESS);
  };

  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle>Select your preferred RPC endpoint</CardTitle>
          <CardDescription>
            If you&apos;re unsure which one to choose, leave this option set to the default.
          </CardDescription>
        </CardHeader>

        <form className='mt-6 flex flex-col gap-4' onSubmit={handleSubmit}>
          <SelectList>
            {randomlySortedEndpoints.map(rpcEndpoint => (
              <SelectList.Option
                key={rpcEndpoint.url}
                label={rpcEndpoint.name}
                secondaryText={rpcEndpoint.url}
                onSelect={value => void setGRPCEndpoint(value)}
                value={rpcEndpoint.url}
                isSelected={rpcEndpoint.url === grpcEndpoint}
                image={!!rpcEndpoint.imageUrl && <img src={rpcEndpoint.imageUrl} />}
              />
            ))}

            <SelectList.Option
              label='Custom RPC'
              secondaryText={
                <input
                  type='url'
                  ref={customRpcEndpointInput}
                  value={isCustomRpcEndpoint && !!grpcEndpoint ? grpcEndpoint : ''}
                  onChange={e => {
                    void setGRPCEndpoint(e.target.value);
                  }}
                  className='w-full bg-transparent'
                />
              }
              onSelect={() => {
                if (!isCustomRpcEndpoint) void setGRPCEndpoint('');
                customRpcEndpointInput.current?.focus();
              }}
              isSelected={isCustomRpcEndpoint}
              value={''}
              image={<Network />}
            />
          </SelectList>

          <Button variant='gradient' className='mt-2' type='submit'>
            Next
          </Button>
        </form>

        <a
          href='https://github.com/penumbra-zone/web/blob/main/apps/extension/src/shared/rpc-endpoints.ts'
          target='_blank'
          rel='noreferrer'
          className='mt-6 block text-right text-xs text-muted-foreground'
        >
          Add to this list
        </a>
      </Card>
    </FadeTransition>
  );
};
