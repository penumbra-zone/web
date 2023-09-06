import { PersonIcon } from '@radix-ui/react-icons';
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from 'ui/components';
import { useStore } from '../state';
import { accountsSelector } from '../state/accounts';
import { AccountActionPopover } from './account-action-popover';

export const AccountsSheet = () => {
  const { all } = useStore(accountsSelector);
  return (
    <Sheet>
      <SheetTrigger>
        <PersonIcon className='h-6 w-6 border rounded-full border-white hover:opacity-50' />
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>Select Wallet</SheetTitle>
        </SheetHeader>
        <div className='flex-1 flex flex-col items-start gap-4 px-4 pt-2'>
          <Button className='w-full' disabled>
            Add Wallet
          </Button>
          {all.map(i => (
            <div
              key={i.label}
              className='flex justify-between items-center pt-3 pb-1 pl-3 pr-[18px] border rounded-lg w-full'
            >
              <div className='flex flex-col text-sm font-bold'>
                <p>{i.label}</p>
                <p className='text-foreground'>penumbrav2t1ruaj9ff2...</p>
              </div>
              <AccountActionPopover />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
