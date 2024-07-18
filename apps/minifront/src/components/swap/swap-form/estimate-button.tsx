import { Button } from '@repo/ui/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@repo/ui/components/ui/tooltip';

export const EstimateButton = ({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled}
            variant='secondary'
            size='sm'
            className='w-full'
            onClick={e => {
              e.preventDefault();
              onClick();
            }}
          >
            Estimate
          </Button>
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
