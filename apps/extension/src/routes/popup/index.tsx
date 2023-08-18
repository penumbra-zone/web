import { useStore } from '../../state';
import { redirect } from 'react-router-dom';
import { localExtStorage } from '../../storage/local';
import { PopupPath } from './paths';
import { sessionExtStorage } from '../../storage/session';
import { accountsSelector } from '../../state/accounts';

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async () => {
  const accounts = await localExtStorage.get('accounts');
  if (!accounts.length) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`page.html`) });
    window.close();
  }

  const password = await sessionExtStorage.get('hashedPassword');
  if (!password) {
    return redirect(PopupPath.ENTER_PASSWORD);
  }
  return null;
};

export const PopupIndex = () => {
  const { all } = useStore(accountsSelector);

  return (
    <div>
      <h3>You&apos;re in! Password in storage.</h3>
      <p>Accounts: </p>
      {all.map(a => {
        return (
          <p key={a.encryptedSeedPhrase}>
            label: {a.label}, {a.encryptedSeedPhrase}
          </p>
        );
      })}
    </div>
  );
};
