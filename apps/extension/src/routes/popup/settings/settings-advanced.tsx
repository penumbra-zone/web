import { DashboardIcon, TimerIcon, TrashIcon } from '@radix-ui/react-icons';
import { CustomLink, FadeTransition, SettingsHeader } from '../../../shared';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

const links = [
  {
    title: 'Auto-lock timer',
    icon: <TimerIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_AUTO_LOCK,
  },
  {
    title: 'Clear cache',
    icon: <TrashIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_CLEAR_CACHE,
  },
];

export const SettingsAdvanced = () => {
  const navigate = usePopupNav();

  return (
    <FadeTransition>
      <div className='min-h-[100vh] w-[100vw] flex flex-col gap-10'>
        <SettingsHeader title='Advanced' />
        <DashboardIcon className=' h-[60px] w-[60px] text-muted-foreground mx-auto' />
        <div className='flex flex-1 flex-col items-start gap-2 px-[30px]'>
          {links.map(i => (
            <CustomLink
              key={i.href}
              title={i.title}
              icon={i.icon}
              onClick={() => navigate(i.href)}
            />
          ))}
        </div>
      </div>
    </FadeTransition>
  );
};
