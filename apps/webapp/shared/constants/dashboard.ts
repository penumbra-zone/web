import { DappPath } from '../../app/header/paths';
import { EduPanel } from '../edu-panels/content';
import { DashboardTabMap } from '../types/dashboard';

export const dashboardTabs = [
  { title: 'Assets', href: DappPath.ASSETS, active: true },
  { title: 'Transactions', href: DappPath.TRANSACTIONS, active: true },
  { title: 'NFTs', href: DappPath.NFTS, active: false },
];

export const dashboardTabsHelper: DashboardTabMap = {
  assets: {
    src: '/funds-gradient.svg',
    label: 'Asset Balances',
    content: EduPanel.ASSETS,
  },
  transactions: {
    src: '/receive-gradient.svg',
    label: 'Transaction history',
    content: EduPanel.TRANSACTIONS_LIST,
  },
  nfts: {
    src: '/ibc-gradient.svg',
    label: 'NFTs history',
    content: EduPanel.TEMP_FILLER,
  },
};
