import { useNavigate } from 'react-router-dom';
import { useStore } from '../state';
import { popupPaths } from '../routes/popup/paths';
import { passwordStoredSelector } from '../state/password';
import { useEffect } from 'react';
import { allAccountsSelector } from '../state/accounts';

// TODO: Document
export const useAccessCheck = () => {
  const navigate = useNavigate();
  const accounts = useStore(allAccountsSelector);
  const passwordInStorage = useStore(passwordStoredSelector);

  useEffect(() => {
    if (!accounts.length) {
      void chrome.tabs.create({ url: chrome.runtime.getURL('page.html') });
    }

    if (!passwordInStorage) {
      navigate(popupPaths.ENTER_PASSWORD);
    }
  }, [accounts.length, navigate, passwordInStorage]);
};
