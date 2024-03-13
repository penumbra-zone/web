import { redirect } from 'react-router-dom';
import { PopupPath } from './paths';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

export const needsLogin = async (): Promise<Response | null> => {
  const password = await sessionExtStorage.get('passwordKey');
  if (password) return null;

  return redirect(PopupPath.LOGIN);
};

export const needsOnboard = async () => {
  const wallets = await localExtStorage.get('wallets');
  if (wallets.length) return null;

  void chrome.runtime.openOptionsPage();
  window.close();

  return null;
};
