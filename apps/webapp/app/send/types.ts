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
  }
>;

export interface Chain {
  name: string;
  icon: string;
}
