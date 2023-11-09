import { DashboardTabMap } from './types';
import { PagePath } from '../metadata/paths.ts';
import { EduPanel } from '../shared/edu-panels/content.ts';

export const dashboardTabs = [
  { title: 'Assets', href: PagePath.DASHBOARD, active: true },
  { title: 'Transactions', href: PagePath.TRANSACTIONS, active: true },
  { title: 'NFTs', href: PagePath.NFTS, active: false },
];

export const dashboardTabsHelper: DashboardTabMap = {
  [PagePath.DASHBOARD]: {
    src: '/funds-gradient.svg',
    label: 'Asset Balances',
    content: EduPanel.ASSETS,
  },
  [PagePath.TRANSACTIONS]: {
    src: '/receive-gradient.svg',
    label: 'Transaction history',
    content: EduPanel.TRANSACTIONS_LIST,
  },
  [PagePath.NFTS]: {
    src: '/ibc-gradient.svg',
    label: 'NFTs history',
    content: EduPanel.TEMP_FILLER,
  },
};
