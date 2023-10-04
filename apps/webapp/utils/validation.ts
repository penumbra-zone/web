const BECH32_PREFIX = 'penumbrav2t';
const ADDRESS_LENGTH = 146;

export const validateAmount = (amount: string, balance: number): boolean =>
  Boolean(amount) && Number(amount) > balance;

// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
// https://github.com/penumbra-zone/penumbra/blob/8d1644620779ddfd961e58f0f4703318b3d08910/crates/core/keys/src/address.rs#L201-L211
export const validateRecipient = (addr: string): boolean =>
  Boolean(addr) && (addr.length !== ADDRESS_LENGTH || !addr.startsWith(BECH32_PREFIX));
