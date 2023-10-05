import { Asset, Chain } from '../../types/asset';
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
    dollarBalance: 200
  },
  {
    name: 'BNB 1',
    icon: '/test-asset-icon-2.svg',
    balance: 1,
    dollarBalance: 10
  },
  {
    name: 'BNB 2',
    icon: '/test-asset-icon-2.svg',
    balance: 0,
    dollarBalance: 10000
  },

  {
    name: 'ETH 2',
    icon: '/test-asset-icon.svg',
    balance: 9,
    dollarBalance: 0.122
  },
  {
    name: 'BNB 3',
    icon: '/test-asset-icon.svg',
    balance: 2001,
    dollarBalance: 213.123
  },
];

export const chains: Chain[] = [
  {
    name: 'Osmosis 1',
    icon: '/test-chain-icon.png',
  },
  {
    name: 'Osmosis 2',
    icon: '/test-chain-icon.png',
  },
  {
    name: 'Osmosis 3',
    icon: '/test-chain-icon.png',
  },
  {
    name: 'Osmosis 4',
    icon: '/test-chain-icon.png',
  },
];
