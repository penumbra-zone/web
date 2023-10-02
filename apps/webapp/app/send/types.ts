export enum SendPageTab {
  SEND = 'send',
  RECEIVE = 'receive',
  IBC = 'ibc',
}

export type TabHelper = Record<
  SendPageTab,
  {
    src: string;
    label: string;
  }
>;
