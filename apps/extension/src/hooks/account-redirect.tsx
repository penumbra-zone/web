import { useNavigate } from 'react-router-dom';
import { useStore } from '../state';
import { popupPaths } from '../routes/popup/paths';
import { passwordStoredSelector } from '../state/password';
import { useEffect } from 'react';
import { allAccountsSelector } from '../state/accounts';

// Meant to:
// - Direct users to onboarding flow if new
// - Guard in the case that session password has expired, requiring them to re-enter it
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
