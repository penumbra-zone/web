export type Result =
  | { belongsToWallet: true; addressIndexAccount: number; ibc: boolean }
  | { belongsToWallet: false };
