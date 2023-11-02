import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../../shared/header/types';
import { DashboardTabMap } from './types';

export const dashboardTabs = [
  { title: 'Assets', href: DappPath.DASHBOARD, active: true },
  { title: 'Transactions', href: DappPath.TRANSACTIONS, active: true },
  { title: 'NFTs', href: DappPath.NFTS, active: false },
];

export const dashboardTabsHelper: DashboardTabMap = {
  [DappPath.DASHBOARD]: {
    src: '/funds-gradient.svg',
    label: 'Asset Balances',
    content: EduPanel.ASSETS,
  },
  [DappPath.TRANSACTIONS]: {
    src: '/receive-gradient.svg',
    label: 'Transaction history',
    content: EduPanel.TRANSACTIONS_LIST,
  },
  [DappPath.NFTS]: {
    src: '/ibc-gradient.svg',
    label: 'NFTs history',
    content: EduPanel.TEMP_FILLER,
  },
};
