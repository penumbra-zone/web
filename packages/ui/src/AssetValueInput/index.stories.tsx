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
import { pnum } from '@penumbra-zone/types/pnum';
import { Text } from '../Text';

const balanceOptions: BalancesResponse[] = [
  PENUMBRA_BALANCE,
  PENUMBRA2_BALANCE,
  OSMO_BALANCE,
];

const assetOptions = [PENUMBRA_METADATA, OSMO_METADATA, PIZZA_METADATA, USDC_METADATA];

// Helper function to validate if amount exceeds balance
const validateAmount = (amount: string, selectedAsset?: BalancesResponse) => {
  if (!amount || !selectedAsset?.balanceView) return {};
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return { amountError: true };
  }

  // Check decimal places (assuming max 6 for most tokens)
  const decimalPlaces = amount.includes('.') ? amount.split('.')[1]?.length || 0 : 0;
  if (decimalPlaces > 6) {
    return { exponentError: true };
  }

  // Get balance value and compare
  const balance = pnum(selectedAsset.balanceView).toNumber();
  if (numericAmount > balance) {
    return { insufficientFunds: true };
  }

  return {};
};

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
  },
  args: {
    balances: balanceOptions,
    assets: assetOptions,
    amountPlaceholder: 'Amount to send...',
    assetDialogTitle: 'Select Asset',
    showBalance: true,
    disabled: false,
    errorMessages: {
      amountError: 'Invalid amount',
      exponentError: 'Invalid decimal length',
      insufficientFunds: 'Insufficient funds',
    },
  },
};
export default meta;

type Story = StoryObj<typeof AssetValueInput>;

/**
 * Basic usage with live validation. Try entering amounts higher than the available balance (123 UM) to see error states.
 */
export const Basic: Story = {
  args: {
    amount: '',
  },

  render: function Render(props) {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);
    const [errors, setErrors] = useState({});

    const handleAmountChange = (newAmount: string) => {
      setAmount(newAmount);
      // Validate in real-time
      const validationErrors = validateAmount(newAmount, selectedAsset);
      setErrors(validationErrors);
    };

    const handleAssetChange = (asset: BalancesResponse) => {
      setSelectedAsset(asset);
      // Re-validate with new asset
      const validationErrors = validateAmount(amount, asset);
      setErrors(validationErrors);
    };

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={handleAmountChange}
        onAssetChange={handleAssetChange}
        errors={errors}
      />
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Interactive example with live validation. The balance shown is 123 UM. Try entering an amount larger than 123 to see the insufficient funds error.',
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
    const [errors, setErrors] = useState({});

    const handleAmountChange = (newAmount: string) => {
      setAmount(newAmount);
      const validationErrors = validateAmount(newAmount, selectedAsset);
      setErrors(validationErrors);
    };

    const handleAssetChange = (asset: BalancesResponse) => {
      setSelectedAsset(asset);
      const validationErrors = validateAmount(amount, asset);
      setErrors(validationErrors);
    };

    return (
      <AssetValueInput
        {...props}
        amount={amount}
        selectedAsset={selectedAsset}
        onAmountChange={handleAmountChange}
        onAssetChange={handleAssetChange}
        errors={errors}
      />
    );
  },
};

/**
 * Demonstrates the insufficient funds error state with custom styling.
 */
export const InsufficientFunds: Story = {
  args: {
    amount: '999999',
    errors: {
      insufficientFunds: true,
    },
    errorMessages: {
      insufficientFunds: 'You do not have enough tokens to complete this transaction',
    },
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
          'Shows the error state when the entered amount exceeds the available balance. The balance display is highlighted in red and an error message appears below.',
      },
    },
  },
};

/**
 * Interactive example showing all validation types. Try different inputs to trigger different errors.
 */
export const InteractiveValidation: Story = {
  render: () => {
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<BalancesResponse>(PENUMBRA_BALANCE);
    const [errors, setErrors] = useState({});

    const handleAmountChange = (newAmount: string) => {
      setAmount(newAmount);
      const validationErrors = validateAmount(newAmount, selectedAsset);
      setErrors(validationErrors);
    };

    const handleAssetChange = (asset: BalancesResponse) => {
      setSelectedAsset(asset);
      const validationErrors = validateAmount(amount, asset);
      setErrors(validationErrors);
    };

    const currentBalance = selectedAsset?.balanceView 
      ? pnum(selectedAsset.balanceView).toNumber() 
      : 0;

    return (
      <div className='flex flex-col gap-4'>
        <div>
          <Text detail color='text.secondary'><Text as='span' detail color='text.primary'>Try these examples:</Text></Text>
          <ul className='list-disc list-inside space-y-1 text-text-secondary text-sm'>
            <li>Enter "123.1234567" for a decimal places error</li>
            <li>Enter "{currentBalance + 1}" for insufficient funds (current balance: {currentBalance})</li>
          </ul>
        </div>
        
        <AssetValueInput
          amount={amount}
          selectedAsset={selectedAsset}
          onAmountChange={handleAmountChange}
          onAssetChange={handleAssetChange}
          errors={errors}
          balances={balanceOptions}
          assets={assetOptions}
          errorMessages={{
            amountError: 'Please enter a valid number',
            exponentError: 'Too many decimal places (max 6)',
            insufficientFunds: `Amount exceeds available balance of ${currentBalance}`,
          }}
        />
      </div>
    );
  },

  parameters: {
    docs: {
      description: {
        story:
          'Interactive example with live validation feedback. Try the suggested inputs to see different error states in action.',
      },
    },
  },
};

/**
 * Shows various validation error states.
 */
export const ValidationErrors: Story = {
  render: () => (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>Amount Error</Text>
        <AssetValueInput
          amount='invalid-amount'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
          errors={{ amountError: true }}
          errorMessages={{ amountError: 'Please enter a valid number' }}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>Exponent Error</Text>
        <AssetValueInput
          amount='123.1234567'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
          errors={{ exponentError: true }}
          errorMessages={{ exponentError: 'Too many decimal places (max 6)' }}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Text large color='text.primary'>Insufficient Funds</Text>
        <AssetValueInput
          amount='99999999'
          onAmountChange={() => {}}
          selectedAsset={PENUMBRA_BALANCE}
          onAssetChange={() => {}}
          balances={balanceOptions}
          assets={assetOptions}
          errors={{ insufficientFunds: true }}
          errorMessages={{ insufficientFunds: 'Not enough balance' }}
        />
      </div>
    </div>
  ),

  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates all possible validation error states: invalid amount format, too many decimal places, and insufficient funds.',
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