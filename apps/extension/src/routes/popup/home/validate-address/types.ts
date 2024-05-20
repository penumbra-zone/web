export type AddressOwnershipInfo =
  | {
      isValidAddress: true;
      belongsToWallet: true;
      addressIndexAccount: number;
      isEphemeral: boolean;
    }
  | { isValidAddress: true; belongsToWallet: false }
  | { isValidAddress: false };
