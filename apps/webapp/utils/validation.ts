const BECH32_PREFIX = 'penumbrav2t';
const ADDRESS_LENGTH = 146;

export const validateAmount = (amount: string, balance: number): boolean =>
  Boolean(amount) && Number(amount) > balance;

//impl std::str::FromStr for Address {
//   type Err = anyhow::Error;

//   fn from_str(s: &str) -> Result<Self, Self::Err> {
//       pb::Address {
//           inner: bech32str::decode(s, bech32str::address::BECH32_PREFIX, bech32str::Bech32m)?,
//           alt_bech32m: String::new(),
//       }
//       .try_into()
//   }
// }
// TODO use later - https://github.com/penumbra-zone/web/pull/63#discussion_r1343992139
export const validateRecipient = (addr: string): boolean =>
  Boolean(addr) && (addr.length !== ADDRESS_LENGTH || !addr.startsWith(BECH32_PREFIX));
