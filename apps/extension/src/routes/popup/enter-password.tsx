import { useNavigate } from 'react-router-dom';
import { popupPaths } from './paths';

export const useCheckPassword = () => {
  const navigate = useNavigate();

  navigate(popupPaths.ENTER_PASSWORD);
};

// export const EnterPassword = () => {};
