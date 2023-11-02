import { EduPanel } from '../../shared/edu-panels/content';
import { DappPath } from '../../shared/header/types';
import { SendMetadataMap, SendTabMap } from './types';

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

export const sendMetadata: SendMetadataMap = {
  [DappPath.SEND]: {
    title: 'Penumbra | Send',
    descriptions: EduPanel.SENDING_FUNDS,
  },
  [DappPath.RECEIVE]: {
    title: 'Penumbra | Receive',
    descriptions: EduPanel.SENDING_FUNDS,
  },
  [DappPath.IBC]: {
    title: 'Penumbra | IBC',
    descriptions: EduPanel.TEMP_FILLER,
  },
};
