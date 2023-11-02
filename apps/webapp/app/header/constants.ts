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
  },
  {
    href: DappPath.POOLS,
    label: 'Pools',
    active: false,
  },
  {
    href: DappPath.GOVERNANCE,
    label: 'Governance',
    active: false,
  },
  {
    href: DappPath.STAKING,
    label: 'Staking',
    active: false,
  },
];
