import { Asset } from '../../types/asset';
import { SendTabMap } from './types';

export const tabsHelper: SendTabMap = {
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
    name: 'ETH 1',
    icon: '/test-asset-icon.svg',
    balance: 2,
  },
  {
    name: 'BNB 1',
    icon: '/test-asset-icon-2.svg',
    balance: 1,
  },
  {
    name: 'BNB 2',
    icon: '/test-asset-icon-2.svg',
    balance: 0,
  },

  {
    name: 'ETH 2',
    icon: '/test-asset-icon.svg',
    balance: 9,
  },
  {
    name: 'BNB 3',
    icon: '/test-asset-icon.svg',
    balance: 2001,
  },
];
