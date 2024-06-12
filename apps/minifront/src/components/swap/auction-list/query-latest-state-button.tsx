import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useRevalidateAuctionInfos } from '../../../state/swap/dutch-auction';

export const QueryLatestStateButton = () => {
  const revalidate = useRevalidateAuctionInfos();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={() => revalidate({ queryLatestState: true })}
          aria-label='Get the current auction reserves (makes a request to a fullnode)'
        >
          <div className='p-2'>
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
