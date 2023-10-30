import { Chain, SendTabMap } from './types';
import { EduPanel } from '../../shared/edu-panels/content';

export const sendTabsHelper: SendTabMap = {
  send: {
    src: '/funds-gradient.svg',
    label: 'Sending funds',
    content: EduPanel.TEMP_FILLER,
  },
  receive: {
    src: '/receive-gradient.svg',
    label: 'Receiving funds',
    content: EduPanel.TEMP_FILLER,
  },
  ibc: {
    src: '/ibc-gradient.svg',
    label: 'IBC funds',
    content: EduPanel.TEMP_FILLER,
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
