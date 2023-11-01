import { EduPanel } from '../../shared/edu-panels/content';

export enum SendPageTab {
  SEND = '/send',
  RECEIVE = '/send/receive',
  IBC = '/send/ibc',
}

export type SendTabMap = Record<
  SendPageTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;
