import { redirect } from 'react-router-dom';
import { PopupPath } from './paths';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { sessionExtStorage } from '@penumbra-zone/storage/chrome/session';

export const needsLogin = async (): Promise<Response | null> => {
  const password = await sessionExtStorage.get('passwordKey');
  if (password) return null;

  return redirect(PopupPath.LOGIN);
};

export const needsOnboard = async () => {
  const wallets = await localExtStorage.get('wallets');
  const numeraireAssetId = await localExtStorage.get('numeraireAssetId');

  if (wallets.length && numeraireAssetId) return null;

  void chrome.runtime.openOptionsPage();
  window.close();

  return null;
};
