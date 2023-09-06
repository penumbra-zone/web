import {
  GlobeIcon,
  HamburgerMenuIcon,
  LockClosedIcon,
  MixerHorizontalIcon,
  PersonIcon,
  SizeIcon,
  TextAlignLeftIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'ui/components';
import { useStore } from '../state';
import { passwordSelector } from '../state/password';
import { usePopupNav } from '../utils/navigate';
import { PopupPath } from '../routes/popup/paths';
import { PagePath } from '../routes/page/paths';

const links = [
  {
    title: 'Advanced',
    icon: <MixerHorizontalIcon className='w-5 h-5 text-foreground' />,
    href: PopupPath.SETTINGS_ADVANCED,
  },
  {
    title: 'Contact Information',
    icon: <PersonIcon className='w-5 h-5 text-foreground' />,
    href: PopupPath.SETTINGS_CONTACTS,
  },
  {
    title: 'Security and Privacy',
    icon: <LockClosedIcon className='w-5 h-5 text-foreground' />,
    href: PopupPath.SETTINGS_SECURITY,
  },
  {
    title: 'Networks',
    icon: <GlobeIcon className='w-5 h-5 text-foreground' />,
    href: PopupPath.SETTINGS_NETWORKS,
  },
  {
    title: 'Permission',
    icon: <TextAlignLeftIcon className='w-5 h-5 text-foreground' />,
    href: PopupPath.SETTINGS_PERMISSION,
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
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className='flex-1 flex flex-col items-start gap-4 px-4'>
          {links.map(i => (
            <Button
              key={i.href}
              variant='ghost'
              className='flex items-center justify-start gap-2 p-[10px] hover:bg-transparent  hover:opacity-50 w-full text-left'
              onClick={() => navigate(i.href)}
            >
              {i.icon}
              <p className='text-foreground'>{i.title}</p>
            </Button>
          ))}
          <Button
            variant='ghost'
            className='flex items-center justify-between p-[10px] hover:bg-transparent  hover:opacity-50 w-full text-left'
            onClick={() =>
              void (async function () {
                await chrome.tabs.create({
                  url: `${chrome.runtime.getURL('page.html')}#${PagePath.INDEX}`,
                });
              })()
            }
          >
            <p className='text-foreground'>Expand view</p>
            <SizeIcon className='w-5 h-5 text-foreground' />
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
