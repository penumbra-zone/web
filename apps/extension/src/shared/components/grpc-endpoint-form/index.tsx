import { FormEvent, useRef } from 'react';
import { SelectList } from '@penumbra-zone/ui/components/ui/select-list';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Network } from 'lucide-react';
import { useGrpcEndpointForm } from './use-grpc-endpoint-form';
import { cn } from '@penumbra-zone/ui/lib/utils';

/**
 * Renders all the parts of the gRPC endpoint form that are shared between the
 * onboarding flow and the RPC settings page.
 */
export const GrpcEndpointForm = ({
  submitButtonLabel,
  onSuccess,
}: {
  submitButtonLabel: string;
  onSuccess: () => void | Promise<void>;
}) => {
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
  const customGrpcEndpointInput = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitButtonEnabled) void onSubmit(onSuccess);
  };

  return (
    <div className='flex flex-col gap-2'>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
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
          {submitButtonLabel}
        </Button>
      </form>

      {(!!rpcError || !!chainId) && (
        <div
          className={cn(
            'flex justify-center font-mono text-xs text-muted-foreground',
            !!rpcError && 'text-red-400',
          )}
        >
          {rpcError ? rpcError : chainId ? `Chain ID: ${chainId}` : null}
        </div>
      )}
    </div>
  );
};
