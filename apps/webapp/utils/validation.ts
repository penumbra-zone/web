const BECH32_PREFIX = 'penumbrav2t';
const ADDRESS_LENGTH = 146;

export const validateAmount = (value: string, balance: number) =>
  Boolean(value) && Number(value) > balance;

export const validateRecepient = (value: string) =>
  Boolean(value) && (value.length !== ADDRESS_LENGTH || !value.startsWith(BECH32_PREFIX));
