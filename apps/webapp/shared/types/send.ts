import { EduPanel } from '../edu-panels/content';

export enum SendPageTab {
  SEND = 'send',
  RECEIVE = 'receive',
  IBC = 'ibc',
}

export type SendTabMap = Record<
  SendPageTab,
  {
    src: string;
    label: string;
    content: EduPanel;
  }
>;

export interface Chain {
  name: string;
  icon: string;
}
