import { SettingsScreen } from './settings-screen';
import { NumeraireForm } from '../../../shared/components/numeraires';
import { NumerairesGradientIcon } from '../../../icons/numeraires-gradient';
import {usePopupNav} from "../../../utils/navigate";
import {PopupPath} from "../paths";

export const SettingsNumeraires = () => {

    const navigate = usePopupNav();

    const onSuccess = async () => {
        navigate(PopupPath.SETTINGS)
    };
  return (
    <SettingsScreen title='Price denominations' IconComponent={NumerairesGradientIcon}>
      <NumeraireForm onSuccess={onSuccess} />
    </SettingsScreen>
  );
};
