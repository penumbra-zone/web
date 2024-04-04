import {
  DashboardIcon,
  ExitIcon,
  Link1Icon,
  LockClosedIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import { CustomLink } from '../../../shared/components/link';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { SettingsScreen } from './settings-screen';

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
    <SettingsScreen title='Settings'>
      <div className='flex flex-1 flex-col items-start gap-5'>
        {links.map(i => (
          <CustomLink key={i.href} title={i.title} icon={i.icon} onClick={() => navigate(i.href)} />
        ))}
      </div>
      <div className='mt-5 border-t border-[rgba(75,75,75,0.50)] pt-5'>
        <CustomLink
          title='Lock Wallet'
          icon={<ExitIcon className='size-5 text-muted-foreground' />}
          onClick={() => {
            clearSessionPassword();
            navigate(PopupPath.LOGIN);
          }}
        />
      </div>
    </SettingsScreen>
  );
};
