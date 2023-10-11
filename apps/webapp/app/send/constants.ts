import { Chain, SendTabMap } from './types';

export const sendTabsHelper: SendTabMap = {
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
