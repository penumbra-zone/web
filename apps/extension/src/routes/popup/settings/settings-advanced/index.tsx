import { TimerIcon, TrashIcon } from '@radix-ui/react-icons';
import { CustomLink, FadeTransition, SettingsHeader } from '../../../../shared';
import { usePopupNav } from '../../../../utils/navigate';
import { PopupPath } from '../../paths';
import { DashboardGradientIcon } from './icon';

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
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-4'>
        <SettingsHeader title='Advanced' />
        <div className='mx-auto mb-6 h-[60px] w-[60px]'>
          <DashboardGradientIcon />
        </div>
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
