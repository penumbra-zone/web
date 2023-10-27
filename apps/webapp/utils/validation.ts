export const validateAmount = (amount: string, balance: number): boolean =>
  Boolean(amount) && Number(amount) > balance;
