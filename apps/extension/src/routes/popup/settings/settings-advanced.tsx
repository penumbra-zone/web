import { TrashIcon } from '@radix-ui/react-icons';
import { CustomLink, SettingsHeader } from '../../../shared';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { DashboardGradientIcon } from '../../../icons';
import { FadeTransition } from '@penumbra-zone/ui';

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
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Advanced' />
        <div className='mx-auto size-20'>
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
