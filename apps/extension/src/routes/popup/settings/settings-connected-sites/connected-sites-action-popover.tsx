import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui/components';

export const ConnectedSitesActionPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='center' className='w-[120px] p-0'>
        <Button variant='outline' className='flex h-11 w-full justify-start rounded-t-lg px-5'>
          Delete
        </Button>
        <Button
          variant='outline'
          className='flex h-11 w-full justify-start rounded-b-lg border-b-0 px-5'
        >
          Edit
        </Button>
      </PopoverContent>
    </Popover>
  );
};
