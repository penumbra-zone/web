import { DashboardTabMap } from './types';
import { EduPanel } from '../../shared/edu-panels/content';

export const dashboardTabsHelper: DashboardTabMap = {
  assets: {
    src: '/funds-gradient.svg',
    label: 'Asset Balances',
    content: EduPanel.ASSETS,
  },
  transactions: {
    src: '/receive-gradient.svg',
    label: 'Transaction history',
    content: EduPanel.TRANSACTIONS,
  },
  nfts: {
    src: '/ibc-gradient.svg',
    label: 'NFTs history',
    content: EduPanel.TEMP_FILLER,
  },
};
