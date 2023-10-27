export enum DashboardPageTab {
  ASSETS = 'assets',
  TRANSACTIONS = 'transactions',
  NFTS = 'nfts',
}

export type DashboardTabMap = Record<
  DashboardPageTab,
  {
    src: string;
    label: string;
    text: string;
  }
>;
