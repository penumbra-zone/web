import { useLoaderData } from 'react-router-dom';
import { BalancesByAccount } from '../../../fetchers/balances/by-account';
import { Account } from './account';

export const Accounts = () => {
  const balancesByAccount = useLoaderData() as BalancesByAccount[];

  return (
    <>
      {balancesByAccount.map(account => (
        <Account account={account} key={account.index.account} />
      ))}
    </>
  );
};
