import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AssetValueInput } from '.';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  PENUMBRA_BALANCE,
  PENUMBRA2_BALANCE,
  OSMO_BALANCE,
} from '../utils/bufs/balances-responses';
import {
  PENUMBRA_METADATA,
  OSMO_METADATA,
  PIZZA_METADATA,
  USDC_METADATA,
} from '../utils/bufs/metadata';
import { Text } from '../Text';

const balanceOptions: BalancesResponse[] = [PENUMBRA_BALANCE, PENUMBRA2_BALANCE, OSMO_BALANCE];

const assetOptions = [PENUMBRA_METADATA, OSMO_METADATA, PIZZA_METADATA, USDC_METADATA];

const meta: Meta<typeof AssetValueInput> = {
  component: AssetValueInput,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    selectedAsset: { control: false },
    amount: { control: 'text' },
    disabled: { control: 'boolean' },
    showBalance: { control: 'boolean' },
    amountPlaceholder: { control: 'text' },
    assetDialogTitle: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    balances: balanceOptions,
    assets: assetOptions,
    amountPlaceholder: 'Amount to send...',
    assetDialogTitle: 'Select Asset',
    showBalance: true,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof AssetValueInput>;

/**
 * Basic usage with automatic validation. The component will automatically validate amount format, decimal places, and balance.
 */
export const Basic: Story = {
  args: {
    amount: '',
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={setAmount}
        onAssetChange={setSelectedAsset}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with automatic validation. Try entering invalid amounts, too many decimals, or amounts larger than the balance (123 UM) to see automatic error handling.',
      },
    },
  },
};

/**
 * Shows the component with a prefilled amount and selected asset.
 */
export const WithValue: Story = {
  args: {
    amount: '100.50',
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('100.50');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(OSMO_BALANCE);

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={setAmount}
        onAssetChange={setSelectedAsset}
      />
    );
  },
};

/**
 * Demonstrates the insufficient funds error state.
 */
export const InsufficientFunds: Story = {
  args: {
    amount: '999999',
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('999999');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={setAmount}
        onAssetChange={setSelectedAsset}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Shows the automatic error state when the entered amount exceeds the available balance. The balance display is highlighted in red and an error message appears below.',
      },
    },
  },
};

/**
 * Interactive example with automatic validation feedback.
 */
export const InteractiveValidation: Story = {
  render: () => {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);

    return (
      <div className='flex flex-col gap-4'>
        <div>
          <Text detail color='text.secondary'>
            <Text as='span' detail color='text.primary'>
              Try these examples:
            </Text>
          </Text>
          <ul className='list-disc list-inside space-y-1 text-text-secondary text-sm'>
            <li>Enter "123.1234567" for a decimal places error</li>
            <li>Enter "999" for insufficient funds (current balance: 123)</li>
          </ul>
        </div>

        <AssetValueInput
          amount={amount}
          selectedAsset={selectedAsset}
          onAmountChange={setAmount}
          onAssetChange={setSelectedAsset}
          balances={balanceOptions}
          assets={assetOptions}
        />
      </div>
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Interactive example with automatic validation feedback. The component validates automatically based on the amount and selected asset.',
      },
    },
  },
};

/**
 * Shows various validation error states with preset values.
 */
export const ValidationErrors: Story = {
  render: () => (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>
          Amount Error
        </Text>
        <AssetValueInput
          amount='invalid-amount'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>
          Exponent Error
        </Text>
        <AssetValueInput
          amount='123.1234567'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>
          Insufficient Funds
        </Text>
        <AssetValueInput
          amount='99999999'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>
          Custom Error
        </Text>
        <AssetValueInput
          amount='50'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
          error='This is a custom validation error from the parent component'
        />
      </div>
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates both automatic validation errors and custom error messages. The last example shows how to override automatic validation with a custom error.',
      },
    },
  },
};

/**
 * Shows the component in disabled state.
 */
export const Disabled: Story = {
  args: {
    amount: '50.25',
    disabled: true,
  },

  render: function Render(props) {
    const [selectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);

    return (
      <AssetValueInput
        {...props}
        selectedAsset={selectedAsset}
        onAmountChange={() => {}}
        onAssetChange={() => {}}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Shows the disabled state where both the amount input and asset selector are non-interactive.',
      },
    },
  },
};

/**
 * Shows the component without balance display.
 */
export const WithoutBalance: Story = {
  args: {
    amount: '25.0',
    showBalance: false,
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('25.0');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(OSMO_BALANCE);

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={setAmount}
        onAssetChange={setSelectedAsset}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Shows the component without the balance display, useful when balance information is not relevant or shown elsewhere.',
      },
    },
  },
};

/**
 * Demonstrates the component with custom placeholders and dialog title.
 */
export const CustomLabels: Story = {
  args: {
    amount: '',
    amountPlaceholder: 'Enter swap amount...',
    assetDialogTitle: 'Choose Token to Swap',
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>();

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={setAmount}
        onAssetChange={setSelectedAsset}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Shows how to customize the placeholder text and dialog title for different use cases like swapping.',
      },
    },
  },
};
