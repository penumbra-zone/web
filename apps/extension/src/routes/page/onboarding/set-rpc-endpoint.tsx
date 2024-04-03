import { Card, CardDescription, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { FormEvent, useRef } from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { ServicesMessage } from '@penumbra-zone/types/src/services';
import { Network } from 'lucide-react';
import { useGrpcEndpointForm } from '../../../hooks/use-grpc-endpoint-form';
import { cn } from '@penumbra-zone/ui/lib/utils';

export const SetRpcEndpoint = () => {
  const {
    chainId,
    grpcEndpoints,
    grpcEndpointInput,
    setGrpcEndpointInput,
    onSubmit,
    rpcError,
    isSubmitButtonEnabled,
    isCustomGrpcEndpoint,
  } = useGrpcEndpointForm();
  const navigate = usePageNav();
  const customGrpcEndpointInput = useRef<HTMLInputElement | null>(null);

  const onSuccess = () => {
    void chrome.runtime.sendMessage(ServicesMessage.OnboardComplete);
    navigate(PagePath.ONBOARDING_SUCCESS);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitButtonEnabled) void onSubmit(onSuccess);
  };

  return (
    <FadeTransition>
      <Card className='w-[400px]' gradient>
        <CardHeader>
          <CardTitle>Select your preferred RPC endpoint</CardTitle>
          <CardDescription>
            The requests you make may reveal your intentions about transactions you wish to make, so
            select an RPC node that you trust. If you&apos;re unsure which one to choose, leave this
            option set to the default.
          </CardDescription>
        </CardHeader>

        <form className='mt-6 flex flex-col gap-4' onSubmit={handleSubmit}>
          <SelectList>
            {grpcEndpoints.map(option => (
              <SelectList.Option
                key={option.url}
                label={option.name}
                secondary={option.url}
                onSelect={setGrpcEndpointInput}
                value={option.url}
                isSelected={option.url === grpcEndpointInput}
                image={
                  !!option.imageUrl && (
                    <img src={option.imageUrl} className='size-full object-contain' />
                  )
                }
              />
            ))}

            <SelectList.Option
              label='Custom RPC'
              secondary={
                <input
                  type='url'
                  ref={customGrpcEndpointInput}
                  value={isCustomGrpcEndpoint && !!grpcEndpointInput ? grpcEndpointInput : ''}
                  onChange={e => setGrpcEndpointInput(e.target.value)}
                  className='w-full bg-transparent'
                />
              }
              onSelect={() => {
                if (!isCustomGrpcEndpoint) setGrpcEndpointInput('');
                customGrpcEndpointInput.current?.focus();
              }}
              isSelected={isCustomGrpcEndpoint}
              image={<Network className='size-full' />}
            />
          </SelectList>

          <a
            href='https://github.com/penumbra-zone/web/blob/main/packages/constants/src/grpc-endpoints.ts'
            target='_blank'
            rel='noreferrer'
            className='block text-right text-xs text-muted-foreground'
          >
            Add to this list
          </a>

          <Button variant='gradient' type='submit' disabled={!isSubmitButtonEnabled}>
            Next
          </Button>
        </form>

        <div
          className={cn(
            'mt-2 flex justify-center font-mono text-xs text-muted-foreground',
            !!rpcError && 'text-red-400',
          )}
        >
          {rpcError ? rpcError : chainId ? `Chain ID: ${chainId}` : null}
        </div>
      </Card>
    </FadeTransition>
  );
};
