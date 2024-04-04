import { EyeGradientIcon } from '../../../icons/eye-gradient';
import { FileTextIcon } from '../../../icons/file-text';
import { CustomLink } from '../../../shared/components/link';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { SettingsScreen } from './settings-screen';

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
    <SettingsScreen title='Security & Privacy' IconComponent={EyeGradientIcon}>
      <div className='flex flex-1 flex-col items-start gap-4'>
        {links.map(i => (
          <CustomLink key={i.href} title={i.title} icon={i.icon} onClick={() => navigate(i.href)} />
        ))}
      </div>
    </SettingsScreen>
  );
};
