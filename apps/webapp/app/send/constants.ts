import { Asset, TabHelper } from './types';

export const tabsHelper: TabHelper = {
  send: {
    src: '/funds-gradient.svg',
    label: 'Sending funds',
  },
  receive: {
    src: '/receive-gradient.svg',
    label: 'Receiving funds',
  },
  ibc: {
    src: '/ibc-gradient.svg',
    label: 'IBC funds',
  },
};

export const assets: Asset[] = [
  {
    name: 'ETH',
    icon: '/test-asset-icon.svg',
  },
  {
    name: 'BNB',
    icon: '/test-asset-icon-2.svg',
  },
];
