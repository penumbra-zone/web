import { redirect } from 'react-router-dom';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';
import { PopupPath } from './paths';
import { REDIRECT_PARAM_KEY } from './login';

export const needsLogin = async (path: PopupPath): Promise<Response | null> => {
  const password = await sessionExtStorage.get('passwordKey');
  if (password) return null;

  return redirect(`${PopupPath.LOGIN}?${REDIRECT_PARAM_KEY}=${path}`);
};

export const needsOnboard = async () => {
  const wallets = await localExtStorage.get('wallets');
  if (wallets.length) return null;

  void chrome.runtime.openOptionsPage();
  window.close();

  return null;
};
