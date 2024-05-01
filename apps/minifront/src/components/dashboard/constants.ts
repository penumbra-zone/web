import { DashboardTabMap } from './types';
import { PagePath } from '../metadata/paths';
import { EduPanel } from '../shared/edu-panels/content';
import { Tab } from '../shared/tabs';

export const dashboardTabs: Tab[] = [
  { title: 'Assets', href: PagePath.DASHBOARD, enabled: true },
  { title: 'Transactions', href: PagePath.TRANSACTIONS, enabled: true },
  { title: 'NFTs', href: PagePath.NFTS, enabled: false },
];

export const dashboardTabsHelper: DashboardTabMap = {
  [PagePath.DASHBOARD]: {
    src: './coin-stack-icon.svg',
    label: 'Asset Balances',
    content: EduPanel.ASSETS,
  },
  [PagePath.TRANSACTIONS]: {
    src: './history-icon.svg',
    label: 'Transaction history',
    content: EduPanel.TRANSACTIONS_LIST,
  },
  [PagePath.NFTS]: {
    src: './ibc-gradient.svg',
    label: 'NFTs history',
    content: EduPanel.TEMP_FILLER,
  },
};
