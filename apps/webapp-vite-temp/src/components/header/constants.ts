import { PagePath } from '../metadata/paths.ts';

export interface HeaderLink {
  href: PagePath;
  label: string;
  active: boolean;
  subLinks?: PagePath[];
}

export const headerLinks: HeaderLink[] = [
  {
    href: PagePath.DASHBOARD,
    label: 'Dashboard',
    active: true,
    subLinks: [PagePath.DASHBOARD, PagePath.TRANSACTIONS, PagePath.NFTS],
  },
  {
    href: PagePath.SEND,
    label: 'Send',
    active: true,
    subLinks: [PagePath.SEND, PagePath.RECEIVE, PagePath.IBC],
  },
  {
    href: PagePath.SWAP,
    label: 'Swap',
    active: false,
  },
  {
    href: PagePath.POOLS,
    label: 'Pools',
    active: false,
  },
  {
    href: PagePath.GOVERNANCE,
    label: 'Governance',
    active: false,
  },
  {
    href: PagePath.STAKING,
    label: 'Staking',
    active: false,
  },
];
