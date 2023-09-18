import { CustomLink, FadeTransition, SettingsHeader } from '../../../../shared';
import { usePopupNav } from '../../../../utils/navigate';
import { PopupPath } from '../../paths';
import { AccountKeyIcon, EyeGradientIcon, FileTextIcon, KeyIcon } from './icon';

const links = [
  {
    title: 'Recovery passphrase',
    icon: <FileTextIcon />,
    href: PopupPath.SETTINGS_RECOVERY_PASSPHRASE,
  },
  {
    title: 'Full viewing key',
    icon: <KeyIcon />,
    href: PopupPath.SETTINGS_FULL_VIEWING_KEY,
  },
  {
    title: 'Spending key',
    icon: <AccountKeyIcon />,
    href: PopupPath.SETTINGS_SPEND_KEY,
  },
];

export const SettingsSecurity = () => {
  const navigate = usePopupNav();

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Security & Privacy' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <EyeGradientIcon />
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
