import { TrashIcon } from '@radix-ui/react-icons';
import { CustomLink } from '../../../shared/components/link';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { DashboardGradientIcon } from '../../../icons/dashboard-gradient';
import { SettingsScreen } from './settings-screen';

const links = [
  // TODO: Enable when ready
  // {
  //   title: 'Auto-lock timer',
  //   icon: <TimerIcon className='h-5 w-5 text-muted-foreground' />,
  //   href: PopupPath.SETTINGS_AUTO_LOCK,
  // },
  {
    title: 'Clear cache',
    icon: <TrashIcon className='size-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_CLEAR_CACHE,
  },
];

export const SettingsAdvanced = () => {
  const navigate = usePopupNav();

  return (
    <SettingsScreen title='Advanced' IconComponent={DashboardGradientIcon}>
      <div className='flex flex-1 flex-col items-start gap-2'>
        {links.map(i => (
          <CustomLink key={i.href} title={i.title} icon={i.icon} onClick={() => navigate(i.href)} />
        ))}
      </div>
    </SettingsScreen>
  );
};
