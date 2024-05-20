import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@penumbra-zone/ui/components/ui/tooltip';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useStore } from '../../../state';

export const QueryLatestStateButton = () => {
  const loadAuctionInfos = useStore(state => state.dutchAuction.loadAuctionInfos);
  const handleClick = () => void loadAuctionInfos(true);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={handleClick}
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
