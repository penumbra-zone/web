import type { Meta, StoryObj } from '@storybook/react';
import { TransactionView } from './TransactionView';
import { TransactionInfo as GrpcTransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressView, Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { Metadata, AssetId, Denom } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

import { TransactionView as PbTransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

// Helper to convert hex string to Uint8Array for mocks
const hexToUint8Array = (hexString: string): Uint8Array => {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
    byteArray[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return byteArray;
};

// Helper to convert UTF8 string to Uint8Array for mocks
const textToUint8Array = (text: string): Uint8Array => new TextEncoder().encode(text);

// Mock getTxMetadata function
const mockGetTxMetadata = (assetIdOrDenom: AssetId | Denom | undefined): Metadata | undefined => {
  // console.log('mockGetTxMetadata called with:', assetIdOrDenom); // Keep for debugging if needed
  const penumbraAssetId = new AssetId({ altBech32m: 'penumbra' });

  if (assetIdOrDenom instanceof AssetId && assetIdOrDenom.equals(penumbraAssetId)) {
    return new Metadata({
      description: 'Penumbra token',
      denomUnits: [
        { denom: 'penumbra', exponent: 6 },
        { denom: 'upenumbra', exponent: 0 },
      ],
      base: 'upenumbra',
      display: 'penumbra',
      name: 'Penumbra',
      symbol: 'UM',
      penumbraAssetId: penumbraAssetId,
    });
  }
  return undefined;
};

// Mock walletAddressViews
const mockWalletAddressViews: AddressView[] = [
  new AddressView({
    addressView: {
      case: 'decoded',
      value: {
        address: { altBech32m: 'penumbrawallet1myselfabcdefghijklmnopqrstuvwxyz0123456789' },
        index: {
          account: 0,
          randomizer: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5]),
        },
        walletId: { inner: textToUint8Array('my_wallet_id_12345') },
      },
    },
  }),
];

const mockFeeAssetId = new AssetId({ altBech32m: 'penumbra' });

// Basic mock for GrpcTransactionInfo (fullTxInfoFromMinifront)
const mockFullTxInfoBasic: GrpcTransactionInfo = new GrpcTransactionInfo({
  id: {
    inner: hexToUint8Array('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
  },
  height: 12345n,
  view: new PbTransactionView({
    bodyView: {
      actionViews: [], // Simplified: No actions for this basic mock to avoid SpendView issues
      memoView: {
        memoView: {
          case: 'visible',
          value: {
            plaintext: {
              text: 'This is a test memo from storybook! Stay Penumbra!',
              returnAddress: new AddressView({
                addressView: {
                  case: 'decoded',
                  value: {
                    address: new Address({
                      altBech32m: 'penumbrareturn1abcdefghijklmnopqrstuvwxyz0123456789',
                    }),
                  },
                },
              }),
            },
          },
        },
      },
      transactionParameters: {
        chainId: 'penumbra-testnet-mock',
        fee: {
          amount: { hi: 0n, lo: 10000n },
          assetId: mockFeeAssetId,
        },
      },
    },
    bindingSig: {
      inner: hexToUint8Array('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
    },
    anchor: {
      inner: hexToUint8Array('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f'),
    },
  }),
});

const meta: Meta<typeof TransactionView> = {
  component: TransactionView,
  title: 'Components/TransactionView', // This title can remain, Storybook will organize it.
  tags: ['autodocs'],
  argTypes: {
    txHash: {
      control: 'text',
      description: 'Transaction hash (optional if fullTxInfoFromMinifront provided)',
    },
    isLoading: { control: 'boolean', description: 'Loading state' },
    error: { control: 'object', description: 'Error object' },
    getTxMetadata: { action: 'getTxMetadata', description: 'Function to get asset metadata' },
    walletAddressViews: { control: 'object', description: 'Array of wallet address views' },
    onDeselectTransaction: {
      action: 'onDeselectTransaction',
      description: 'Callback for closing the view',
    },
    fullTxInfoFromMinifront: {
      control: 'object',
      description: 'Full transaction info from minifront',
    },
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        height: '800px',
      },
    },
  },
  decorators: [
    StoryComponent => (
      <div
        style={{ maxWidth: '800px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}
      >
        <StoryComponent />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionView>;

export const DefaultLoading: Story = {
  args: {
    isLoading: true,
    getTxMetadata: mockGetTxMetadata,
    walletAddressViews: mockWalletAddressViews,
  },
};

export const DefaultError: Story = {
  args: {
    isLoading: false,
    error: new Error('Failed to load transaction details from Storybook mock.'),
    getTxMetadata: mockGetTxMetadata,
    walletAddressViews: mockWalletAddressViews,
  },
};

export const MyViewLoaded: Story = {
  args: {
    isLoading: false,
    fullTxInfoFromMinifront: mockFullTxInfoBasic,
    getTxMetadata: mockGetTxMetadata,
    walletAddressViews: mockWalletAddressViews,
    onDeselectTransaction: () => console.log('Deselect transaction triggered from Story'),
  },
};

// TODO: Add stories for Public View and Receiver View by:
// 1. Creating specific GrpcTransactionInfo objects with `view` pre-set to a public or receiver perspective.
//    This might involve manually constructing or using perspective-js translators with more detailed mocks.
//
// Example: To show a Public View, you would create a `mockFullTxInfoPublic` where the `view` field of
// `GrpcTransactionInfo` is populated with the result of `asPublicTransactionView(somePrivatePbTransactionView)`.
// Similar for Receiver View.
