import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

/**
 * Represents an asset with its display information
 */
export interface AssetMock {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string | null;
  icon?: string;
}

/**
 * Represents an account with its assets
 */
export interface AccountMock {
  id: string;
  name: string;
  assets: AssetMock[];
  addressView?: AddressView;
}

/**
 * Create a mock address view with account information.
 * This structure is designed to be compatible with AddressViewComponent and internal Penumbra functions.
 */
const createMockAddressView = (accountName: string): AddressView => {
  const isMainAccount = accountName === 'Main Account';
  let accountNumber: number;
  if (isMainAccount) {
    accountNumber = 0;
  } else if (accountName.includes('#1')) {
    accountNumber = 1;
  } else {
    accountNumber = 1000;
  }

  return new AddressView({
    addressView: {
      case: 'decoded',
      value: {
        address: {
          inner: new Uint8Array(80).fill(accountNumber),
          altBech32m: `penumbra1${accountName.replace(/\s+/g, '').toLowerCase()}`,
        },
        index: {
          account: accountNumber,
          randomizer: new Uint8Array(3).fill(0),
        },
      },
    },
  });
};

/**
 * Mock account data
 */
export const mockAccounts: AccountMock[] = [
  {
    id: '1',
    name: 'Main Account',
    addressView: createMockAddressView('Main Account'),
    assets: [
      {
        id: '1',
        name: 'Penumbra',
        symbol: 'UM',
        amount: '1,250.75',
        value: null,
        icon: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
      },
      {
        id: '2',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: '2.35',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png',
      },
      {
        id: '3',
        name: 'USD Coin',
        symbol: 'USDC',
        amount: '3,500.00',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png',
      },
      {
        id: '4',
        name: 'Bitcoin',
        symbol: 'BTC',
        amount: '0.045',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/bitcoin/images/btc.png',
      },
    ],
  },
  {
    id: '2',
    name: 'Sub-Account #1',
    addressView: createMockAddressView('Sub-Account #1'),
    assets: [
      {
        id: '5',
        name: 'Solana',
        symbol: 'SOL',
        amount: '85.25',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/nsol.png',
      },
      {
        id: '6',
        name: 'Avalanche',
        symbol: 'AVAX',
        amount: '120.50',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/wavax.svg',
      },
    ],
  },
  {
    id: '3',
    name: 'Sub-Account #1000',
    addressView: createMockAddressView('Sub-Account #1000'),
    assets: [
      {
        id: '7',
        name: 'Polkadot',
        symbol: 'DOT',
        amount: '450.25',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png',
      },
      {
        id: '8',
        name: 'Tether',
        symbol: 'USDT',
        amount: '1,000.00',
        value: null,
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png',
      },
    ],
  },
];
