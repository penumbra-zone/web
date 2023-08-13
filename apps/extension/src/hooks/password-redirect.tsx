import { useNavigate } from 'react-router-dom';
import { useStore } from '../state';
import { passwordStoredSelector } from '../state/accounts';
import { popupPaths } from '../routes/popup/paths';

export const usePasswordCheck = () => {
  const navigate = useNavigate();
  const passwordInStorage = useStore(passwordStoredSelector);

  if (!passwordInStorage) {
    navigate(popupPaths.ENTER_PASSWORD);
  }
};
