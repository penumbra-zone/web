import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../header/paths';
import { SendTabMap } from './types';

export const sendTabsHelper: SendTabMap = {
  [DappPath.SEND]: {
    src: '/funds-gradient.svg',
    label: 'Sending Funds',
    content: EduPanel.SENDING_FUNDS,
  },
  [DappPath.RECEIVE]: {
    src: '/receive-gradient.svg',
    label: 'Receiving Funds',
    content: EduPanel.RECEIVING_FUNDS,
  },
  [DappPath.IBC]: {
    src: '/ibc-gradient.svg',
    label: 'IBC funds',
    content: EduPanel.TEMP_FILLER,
  },
};

export const sendTabs = [
  { title: 'Send', href: DappPath.SEND, active: true },
  { title: 'Receive', href: DappPath.RECEIVE, active: true },
  { title: 'IBC', href: DappPath.IBC, active: false },
];
