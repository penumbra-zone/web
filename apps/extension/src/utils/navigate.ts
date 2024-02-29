import { NavigateOptions, useNavigate } from 'react-router-dom';
import { PagePath } from '../routes/page/paths';
import { PopupPath } from '../routes/popup/paths';

// Used to add type-safety to navigating routes
export const useTypesafeNav = <T extends string>() => {
  const navigate = useNavigate();
  return (to: T | number, options?: NavigateOptions): void => {
    if (typeof to === 'number') navigate(to);
    else navigate(to, options);
  };
};

export const usePageNav = useTypesafeNav<PagePath>;
export const usePopupNav = useTypesafeNav<PopupPath>;
