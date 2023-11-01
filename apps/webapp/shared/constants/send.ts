import { DappPath } from '../../app/header/paths';
import { EduPanel } from '../edu-panels/content';
import { SendTabMap } from '../types/send';

export const sendTabsHelper: SendTabMap = {
  send: {
    src: '/funds-gradient.svg',
    label: 'Sending Funds',
    content: EduPanel.SENDING_FUNDS,
  },
  receive: {
    src: '/receive-gradient.svg',
    label: 'Receiving Funds',
    content: EduPanel.RECEIVING_FUNDS,
  },
  ibc: {
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
