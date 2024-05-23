import { buttonVariants } from '@penumbra-zone/ui/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { AllSlices } from '../../../../state';
import { useStoreShallow } from '../../../../utils/use-store-shallow';

const simulateSwapButtonSelector = (state: AllSlices) => ({
  loading: state.swap.instantSwap.simulateSwapLoading,
  simulateSwap: state.swap.instantSwap.simulateSwap,
});

export const SimulateSwapButton = () => {
  const { loading, simulateSwap } = useStoreShallow(simulateSwapButtonSelector);

  return (
    <div className='grow'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className='w-full'>
            <div
              // Nested buttons are not allowed. Manually passing button classes.
              className={cn(
                'w-full',
                buttonVariants({ variant: 'secondary' }),
                loading ? 'animate-pulse duration-700' : undefined,
              )}
              onClick={e => {
                e.preventDefault();
                void simulateSwap();
              }}
            >
              Estimate
            </div>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='w-60'>
            <p>
              Privacy note: This makes a request to your config&apos;s gRPC node to simulate a swap
              of these assets. That means you are possibly revealing your intent to this node.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
