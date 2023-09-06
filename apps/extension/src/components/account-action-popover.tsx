import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui/components';

export const AccountActionPopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent>
        <Button variant='ghost' className='justify-end text-card w-full'>
          View Recovery Phrase
        </Button>
        <Button variant='ghost' className='justify-end text-card w-full'>
          View Spend Key
        </Button>
        <Button variant='ghost' className='justify-end text-card w-full'>
          Change Wallet Name
        </Button>
        <Button variant='ghost' className='justify-end text-card w-full'>
          Delete Wallet
        </Button>
      </PopoverContent>
    </Popover>
  );
};
