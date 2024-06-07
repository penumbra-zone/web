import { HomeGradientIcon } from '../../../icons/home-gradient';
import { SettingsScreen } from './settings-screen';
import { DefaultFrontendForm } from '../../../shared/components/default-frontend-form';

export const SettingsDefaultFrontend = () => {
  return (
    <SettingsScreen title='Default Frontend' IconComponent={HomeGradientIcon}>
      <DefaultFrontendForm />
    </SettingsScreen>
  );
};
