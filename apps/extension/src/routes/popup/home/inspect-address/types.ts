export type AddressOwnershipInfo =
  | { belongsToWallet: true; addressIndexAccount: number; isEphemeral: boolean }
  | { belongsToWallet: false };
