import { DappPath } from '../../shared/header/types';
import { HeaderLink } from './types';

export const headerLinks: HeaderLink[] = [
  {
    href: DappPath.DASHBOARD,
    label: 'Dashboard',
    active: true,
    subLinks: [DappPath.DASHBOARD, DappPath.TRANSACTIONS, DappPath.NFTS],
  },
  {
    href: DappPath.SEND,
    label: 'Send',
    active: true,
    subLinks: [DappPath.SEND, DappPath.RECEIVE, DappPath.IBC],
  },
  {
    href: DappPath.SWAP,
    label: 'Swap',
    active: false,
    subLinks: [DappPath.SWAP],
  },
  {
    href: DappPath.POOLS,
    label: 'Pools',
    active: false,
    subLinks: [DappPath.POOLS],
  },
  {
    href: DappPath.GOVERNANCE,
    label: 'Governance',
    active: false,
    subLinks: [DappPath.GOVERNANCE],
  },
  {
    href: DappPath.STAKING,
    label: 'Staking',
    active: false,
    subLinks: [DappPath.STAKING],
  },
];

export const transactionLink = {
  href: DappPath.TRANSACTION,
  label: 'Transaction',
  subLinks: [DappPath.TRANSACTION],
};
