import type { Meta, StoryObj } from '@storybook/react';
import { InfoCardTitle } from './index';
import { Text } from '../Text';

const meta: Meta<typeof InfoCardTitle> = {
  component: InfoCardTitle,
  tags: ['autodocs'],
  parameters: {
    viewMode: 'docs',
  },
};

export default meta;

type Story = StoryObj<typeof InfoCardTitle>;

// Example usage similar to AssetsCardTitle
export const AssetBalances: Story = {
  args: {
    title: 'Asset Balances',
    dialogTitle: 'Asset Balances',
    dialogContent: (
      <Text>
        Your balances are shielded, and are known only to you. They are not visible on chain.
        Each Penumbra wallet controls many numbered accounts, each with its own balance. Account
        information is never revealed on-chain.
      </Text>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows an Asset Balances title with a ShieldQuestion icon button (slim, secondary style) that opens a dialog with information about shielded balances.'
      }
    }
  }
};

// Example usage similar to TransactionsCardTitle
export const TransactionsList: Story = {
  args: {
    title: 'Transactions List',
    dialogTitle: 'Transactions List',
    dialogContent: (
      <Text>
        Your wallet scans shielded chain data locally and indexes all relevant transactions it
        detects, both incoming and outgoing.
      </Text>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a Transactions List title with a ShieldQuestion icon button that opens a dialog with information about transactions.'
      }
    }
  }
};

// Example with a string dialogContent
export const StringContent: Story = {
  args: {
    title: 'Simple Title',
    dialogContent: 'This is a simple string content that will be wrapped in a Text component.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a simple string as dialog content, which gets automatically wrapped in a Text component.'
      }
    }
  }
}; 