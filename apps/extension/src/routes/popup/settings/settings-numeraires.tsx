import { SettingsScreen } from './settings-screen';
import { NumerairesGradientIcon } from '../../../icons/numeraires-gradient';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { NumeraireForm } from '../../../shared/components/numeraires-form';

export const SettingsNumeraires = () => {
  const navigate = usePopupNav();

  const onSuccess = () => {
    navigate(PopupPath.INDEX);
  };
  return (
    <SettingsScreen title='Price denominations' IconComponent={NumerairesGradientIcon}>
      <NumeraireForm onSuccess={onSuccess} />
    </SettingsScreen>
  );
};
