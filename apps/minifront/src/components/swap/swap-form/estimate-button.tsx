import { buttonVariants } from '@penumbra-zone/ui/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { cn } from '@penumbra-zone/ui/lib/utils';

export const EstimateButton = ({
  loading,
  disabled,
  onClick,
}: {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          // Style as a button
          className={cn(
            'w-full',
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            loading ? 'animate-pulse duration-700' : undefined,
          )}
          onClick={e => {
            e.preventDefault();
            onClick();
          }}
          disabled={disabled}
        >
          Estimate
        </TooltipTrigger>
        <TooltipContent side='bottom' className='w-60'>
          <p>
            Privacy note: This makes a request to your config&apos;s gRPC node to simulate a swap of
            these assets. That means you are possibly revealing your intent to this node.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
