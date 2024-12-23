import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui-deprecated/components/ui/tooltip';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useAuctionInfos, useRevalidateAuctionInfos } from '../../../state/swap/dutch-auction';
import { cn } from '@penumbra-zone/ui-deprecated/lib/utils';

export const QueryLatestStateButton = () => {
  const { loading } = useAuctionInfos();
  const revalidate = useRevalidateAuctionInfos();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={() => revalidate({ queryLatestState: true })}
          aria-label='Get the current auction reserves (makes a request to a fullnode)'
          disabled={loading}
        >
          <div
            className={cn(
              'p-2 transition-transform',
              loading && 'animate-spin text-muted-foreground',
              !loading && 'hover:rotate-45',
            )}
          >
            <ReloadIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Get the current auction reserves
          <br />
          (makes a request to a fullnode)
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
