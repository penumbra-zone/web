import { DashboardTabMap } from './types';

export const dashboardTabsHelper: DashboardTabMap = {
  assets: {
    src: '/funds-gradient.svg',
    label: 'Asset Balances',
    text: 'Your balances are shielded, and are known only to you.  They are not visible on chain.'
  },
  transactions: {
    src: '/receive-gradient.svg',
    label: 'Transaction history',
    text: 'This is a list of all transactions visible to your wallet, both incoming and outgoing.'
  },
  nfts: {
    src: '/ibc-gradient.svg',
    label: 'NFTs history',
    text: 'NFTs are not yet supported',
  },
};
