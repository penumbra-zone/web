import { SendTabMap } from './types';
import { PagePath } from '../metadata/paths.ts';
import { EduPanel } from '../shared/edu-panels/content.ts';

export const sendTabsHelper: SendTabMap = {
  [PagePath.SEND]: {
    src: '/funds-gradient.svg',
    label: 'Sending Funds',
    content: EduPanel.SENDING_FUNDS,
  },
  [PagePath.RECEIVE]: {
    src: '/receive-gradient.svg',
    label: 'Receiving Funds',
    content: EduPanel.RECEIVING_FUNDS,
  },
  [PagePath.IBC]: {
    src: '/ibc-gradient.svg',
    label: 'IBC funds',
    content: EduPanel.TEMP_FILLER,
  },
};

export const sendTabs = [
  { title: 'Send', href: PagePath.SEND, active: true },
  { title: 'Receive', href: PagePath.RECEIVE, active: true },
  { title: 'IBC', href: PagePath.IBC, active: false },
];
