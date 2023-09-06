import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui/components';

export const AccountActionPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent>
        <Button variant='ghost' className='w-full justify-end text-card'>
          View Recovery Phrase
        </Button>
        <Button variant='ghost' className='w-full justify-end text-card'>
          View Spend Key
        </Button>
        <Button variant='ghost' className='w-full justify-end text-card'>
          Change Wallet Name
        </Button>
        <Button variant='ghost' className='w-full justify-end text-card'>
          Delete Wallet
        </Button>
      </PopoverContent>
    </Popover>
  );
};
