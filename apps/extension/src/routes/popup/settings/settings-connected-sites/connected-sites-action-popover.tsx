import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@penumbra-zone/ui';
import { useStore } from '../../../../state';
import { connectedSitesSelector } from '../../../../state/connected-sites';

interface ConnectedSitesActionPopoverProps {
  origin: string;
}

export const ConnectedSitesActionPopover = ({ origin }: ConnectedSitesActionPopoverProps) => {
  const { removeOrigin } = useStore(connectedSitesSelector);
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='center' className='w-[120px] p-0'>
        <Button
          variant='outline'
          className='flex h-11 w-full justify-start rounded-t-lg px-5'
          onClick={() => void (async () => await removeOrigin(origin))()}
        >
          Delete
        </Button>
      </PopoverContent>
    </Popover>
  );
};
