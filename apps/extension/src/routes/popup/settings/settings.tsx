import {
  DashboardIcon,
  ExitIcon,
  Link1Icon,
  LockClosedIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import { CustomLink, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { FadeTransition } from '@penumbra-zone/ui';

const links = [
  {
    title: 'Security & Privacy',
    icon: <LockClosedIcon className='size-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_SECURITY,
  },
  {
    title: 'RPC',
    icon: <Share1Icon className='size-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_RPC,
  },
  {
    title: 'Connected sites',
    icon: <Link1Icon className='size-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_CONNECTED_SITES,
  },
  {
    title: 'Advanced',
    icon: <DashboardIcon className='size-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_ADVANCED,
  },
];

export const Settings = () => {
  const navigate = usePopupNav();
  const { clearSessionPassword } = useStore(passwordSelector);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col justify-between gap-6'>
        <SettingsHeader title='Settings' />
        <div className='flex flex-1 flex-col items-start gap-5 px-[30px]'>
          {links.map(i => (
            <CustomLink
              key={i.href}
              title={i.title}
              icon={i.icon}
              onClick={() => navigate(i.href)}
            />
          ))}
        </div>
        <div className='h-[66px] border-t border-[rgba(75,75,75,0.50)] px-5 pb-[30px] pt-2'>
          <CustomLink
            title='Lock Wallet'
            icon={<ExitIcon className='size-5 text-muted-foreground' />}
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
