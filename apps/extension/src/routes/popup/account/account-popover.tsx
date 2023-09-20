import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Button, Popover, PopoverContent, PopoverTrigger } from 'ui/components';
import { PopupPath } from '../paths';
import { usePopupNav } from '../../../utils/navigate';

export const AccountPopover = () => {
  const navigate = usePopupNav();
  return (
    <Popover>
      <PopoverTrigger>
        <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='center' className='w-[240px] p-0'>
        <Button
          onClick={() => navigate(PopupPath.SETTINGS_RECOVERY_PASSPHRASE)}
          variant='outline'
          className='flex h-11 w-full justify-start rounded-t-lg px-5'
        >
          View Recovery Passphrase
        </Button>
        <Button
          onClick={() => navigate(PopupPath.SETTINGS_FULL_VIEWING_KEY)}
          variant='outline'
          className='flex h-11 w-full justify-start px-5'
        >
          View Full Viewing Key
        </Button>
        <Button
          onClick={() => navigate(PopupPath.SETTINGS_SPEND_KEY)}
          variant='outline'
          className='flex h-11 w-full justify-start px-5'
        >
          View Spend key
        </Button>
        <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
          Change Wallet Name
        </Button>
        <Button
          variant='outline'
          className='flex h-11 w-full justify-start rounded-b-lg border-b-0 px-5'
        >
          Delete Wallet
        </Button>
      </PopoverContent>
    </Popover>
  );
};
