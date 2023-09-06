import {
  HamburgerMenuIcon,
  MixerHorizontalIcon,
  PersonIcon,
  SizeIcon,
} from '@radix-ui/react-icons';
import { Button, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from 'ui/components';
import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { usePopupNav } from '../utils/navigate';
import { PopupPath } from '../routes/popup/paths';
import { PagePath } from '../routes/page/paths';

const links = [
  {
    title: 'Settings',
    icon: <MixerHorizontalIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS,
  },
  {
    title: 'Contact Information',
    icon: <PersonIcon className='h-5 w-5 text-foreground' />,
    href: PopupPath.SETTINGS_CONTACTS,
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
      <SheetContent side='left'>
        <SheetHeader className=''></SheetHeader>
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
          <Button
            variant='ghost'
            className='flex w-full items-center justify-between p-[10px]  text-left hover:bg-transparent hover:opacity-50'
            onClick={() =>
              void (async function () {
                await chrome.tabs.create({
                  url: `${chrome.runtime.getURL('page.html')}#${PagePath.INDEX}`,
                });
              })()
            }
          >
            <p className='text-foreground'>Expand View</p>
            <SizeIcon className='h-5 w-5 text-foreground' />
          </Button>
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
