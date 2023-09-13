import { PersonIcon } from '@radix-ui/react-icons';
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from 'ui/components';
import { useStore } from '../../../state';
import { walletsSelector } from '../../../state/wallets';
import { AccountActionPopover } from '../../../components/account-action-popover';

export const AccountsSheet = () => {
  const { all } = useStore(walletsSelector);
  return (
    <Sheet>
      <SheetTrigger>
        <PersonIcon className='h-6 w-6 rounded-full border border-white hover:opacity-50' />
      </SheetTrigger>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>Select Wallet</SheetTitle>
        </SheetHeader>
        <div className='flex flex-1 flex-col items-start gap-4 px-4 pt-2'>
          <Button className='w-full' disabled>
            Add Wallet
          </Button>
          {all.map(i => (
            <div
              key={i.label}
              className='flex w-full items-center justify-between rounded-lg border pb-1 pl-3 pr-[18px] pt-3'
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
