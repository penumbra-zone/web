import { useLoaderData } from 'react-router-dom';
import { BalancesByAccount } from '../../../fetchers/balances/by-account';
import { Account } from './account';

export const Accounts = () => {
  const balancesByAccount = useLoaderData() as BalancesByAccount[];

  /** @todo: Move `index` into Zustand state, and render an account switcher. */
  const index = 0;

  if (!balancesByAccount[index]) return null;

  return <Account account={balancesByAccount[index]} />;
};
