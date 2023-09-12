import {
  DashboardIcon,
  ExitIcon,
  Link1Icon,
  LockClosedIcon,
  Share1Icon,
  TextAlignLeftIcon,
} from '@radix-ui/react-icons';
import { CustomLink, FadeTransition, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

const links = [
  {
    title: 'Advanced',
    icon: <DashboardIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_ADVANCED,
  },
  {
    title: 'Security & Privacy',
    icon: <LockClosedIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_SECURITY,
  },
  {
    title: 'Permission',
    icon: <TextAlignLeftIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_PERMISSION,
  },
  {
    title: 'Networks',
    icon: <Share1Icon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_NETWORKS,
  },
  {
    title: 'Connected sites',
    icon: <Link1Icon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_CONNECTED_SITES,
  },
];

export const Settings = () => {
  const navigate = usePopupNav();
  const { clearSessionPassword } = useStore(passwordSelector);
  
  return (
    <FadeTransition>
      <div className='min-h-[100vh] w-[100vw] flex flex-col justify-between gap-6'>
        <SettingsHeader title='Settings' />
        <div className='flex flex-1 flex-col items-start gap-4 px-4'>
          {links.map(i => (
            <CustomLink
              key={i.href}
              title={i.title}
              icon={i.icon}
              onClick={() => navigate(i.href)}
            />
          ))}
        </div>
        <div className='border-t h-[66px] border-[rgba(75,75,75,0.50)] pt-2 pb-[30px] px-5'>
          <CustomLink
            title='Lock Wallet'
            icon={<ExitIcon className='h-5 w-5 text-muted-foreground' />}
            onClick={() => {
              clearSessionPassword();
              navigate(PopupPath.LOGIN);
            }}
          />
        </div>
      </div>
    </FadeTransition>
  );
};
