import { useAccessCheck } from '../../hooks/account-redirect';
import { useStore } from '../../state';
import { allAccountsSelector } from '../../state/accounts';

export const PopupIndex = () => {
  useAccessCheck();

  const accounts = useStore(allAccountsSelector);

  return (
    <div>
      <h3>You&apos;re in! Password in storage.</h3>
      <p>Accounts: </p>
      {accounts.map((a) => {
        return (
          <p key={a.encryptedSeedPhrase}>
            label: {a.label}, {a.encryptedSeedPhrase}
          </p>
        );
      })}
    </div>
  );
};
