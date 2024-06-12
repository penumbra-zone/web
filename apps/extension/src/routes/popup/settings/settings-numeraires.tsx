import { SettingsScreen } from './settings-screen';
import { NumeraireForm } from '../../../shared/components/numeraires';
import { NumerairesGradientIcon } from '../../../icons/numeraires-gradient';

export const SettingsNumeraires = () => {
  return (
    <SettingsScreen title='Price denominations' IconComponent={NumerairesGradientIcon}>
      <NumeraireForm />
    </SettingsScreen>
  );
};
