import type { Meta, StoryObj } from '@storybook/react';
import { InfoButton } from './index';
import { Coins, Send, ShieldAlert } from 'lucide-react';

const meta: Meta<typeof InfoButton> = {
  component: InfoButton,
  tags: ['autodocs'],
  parameters: {
    viewMode: 'docs',
  },
};

export default meta;

type Story = StoryObj<typeof InfoButton>;

export const PortfolioInfo: Story = {
  args: {
    dialogTitle: 'Shielded Portfolio',
    sections: [
      {
        title: 'Asset Balances',
        icon: <Coins size={18} />,
        content: 'Your balances are shielded, and are known only to you. They are not visible on chain. Each Penumbra wallet controls many numbered accounts, each with its own balance. Account information is never revealed on-chain.'
      },
      {
        title: 'Transaction History',
        icon: <Send size={18} />,
        content: 'Your wallet scans shielded chain data locally and indexes all relevant transactions it detects, both incoming and outgoing.'
      },
      {
        title: 'Shielded Transactions',
        icon: <ShieldAlert size={18} />,
        content: 'Penumbra transactions are shielded and don\'t reveal any information about the sender, receiver, or amount. Use the toggle to see what information is revealed on-chain.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows an InfoButton that opens a dialog with multiple sections of information about the shielded portfolio.'
      }
    }
  }
};

export const SimpleExample: Story = {
  args: {
    dialogTitle: 'Information',
    sections: [
      {
        title: 'What is this?',
        content: 'This is an example of the InfoButton component with a simple section.'
      },
      {
        title: 'How to use it',
        content: 'Add this component to any Card or UI element where you want to provide additional information to the user.'
      }
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple example with just two text sections without icons.'
      }
    }
  }
}; 