import { ShareGradientIcon } from '../../../icons/share-gradient';
import { SettingsScreen } from './settings-screen';
import { DefaultFrontendForm } from '../../../shared/components/default-frontend-form';

export const SettingsDefaultFrontend = () => {
  return (
    <SettingsScreen title='Default Frontend' IconComponent={ShareGradientIcon}>
      <DefaultFrontendForm />
    </SettingsScreen>
  );
};
