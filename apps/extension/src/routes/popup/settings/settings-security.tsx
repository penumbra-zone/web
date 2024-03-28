import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { EyeGradientIcon } from '../../../icons/eye-gradient';
import { FileTextIcon } from '../../../icons/file-text';
import { SettingsHeader } from '../../../shared/components/settings-header';
import { CustomLink } from '../../../shared/components/link';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

const links = [
  {
    title: 'Recovery passphrase',
    icon: <FileTextIcon />,
    href: PopupPath.SETTINGS_RECOVERY_PASSPHRASE,
  },
  //TODO bring it back if we`ll have reason
  // {
  //   title: 'Full viewing key',
  //   icon: <KeyIcon />,
  //   href: PopupPath.SETTINGS_FULL_VIEWING_KEY,
  // },
  // {
  //   title: 'Spending key',
  //   icon: <AccountKeyIcon />,
  //   href: PopupPath.SETTINGS_SPEND_KEY,
  // },
];

export const SettingsSecurity = () => {
  const navigate = usePopupNav();

  return (
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title='Security & Privacy' />
        <div className='mx-auto size-20'>
          <EyeGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start gap-4 px-[30px]'>
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
