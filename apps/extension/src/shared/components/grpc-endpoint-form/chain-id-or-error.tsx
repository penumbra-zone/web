import { cn } from '@penumbra-zone/ui/lib/utils';

export const ChainIdOrError = ({
  error,
  chainId,
  chainIdChanged,
}: {
  error?: string;
  chainId?: string;
  chainIdChanged: boolean;
}) => {
  if (!error && !chainId) return null;

  return (
    <div
      className={cn(
        'flex justify-center font-mono text-xs text-muted-foreground',
        !!error && 'text-red-400',
        !error && chainIdChanged && 'text-rust',
      )}
    >
      {error ? error : chainId ? `Chain ID: ${chainId}` : null}
    </div>
  );
};
