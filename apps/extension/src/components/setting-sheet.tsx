import { HamburgerMenuIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Button, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from 'ui/components';
import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { usePopupNav } from '../utils/navigate';
import { PopupPath } from '../routes/popup/paths';

const links = [
  {
    title: 'Settings',
    icon: <MixerHorizontalIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS,
  },
];

export const SettingSheet = () => {
  const navigate = usePopupNav();

  const { clearSessionPassword } = useStore(passwordSelector);
  return (
    <Sheet>
      <SheetTrigger>
        <HamburgerMenuIcon className='h-6 w-6 hover:opacity-50' />
      </SheetTrigger>
      <SheetContent side='left' className='flex flex-col'>
        <SheetHeader />
        <div className='flex flex-1 flex-col items-start gap-4 px-4'>
          {links.map(i => (
            <Button
              key={i.href}
              variant='ghost'
              className='flex w-full items-center justify-start gap-2 p-[10px]  text-left hover:bg-transparent hover:opacity-50'
              onClick={() => navigate(i.href)}
            >
              {i.icon}
              <p className='text-foreground'>{i.title}</p>
            </Button>
          ))}
        </div>
        <SheetFooter>
          <Button
            onClick={() => {
              clearSessionPassword();
              navigate(PopupPath.LOGIN);
            }}
          >
            Lock Wallet
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
