import { useNavigate } from 'react-router-dom';
import { useStore } from '../state';
import { passwordStoredSelector } from '../state/password';
import { useEffect } from 'react';
import { allAccountsSelector } from '../state/accounts';
import { PopupPath } from '../routes/popup/paths';

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
      navigate(PopupPath.ENTER_PASSWORD);
    }
  }, [accounts.length, navigate, passwordInStorage]);
};
