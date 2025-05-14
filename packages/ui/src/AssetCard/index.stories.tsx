import type { Meta, StoryObj } from '@storybook/react';
// import { Density } from '../Density';
import { AssetCard } from './index';
import { mockAccounts } from './mock';

const meta: Meta<typeof AssetCard> = {
  component: AssetCard,
  tags: ['autodocs'],
  parameters: {
    viewMode: 'docs',
    backgrounds: {
      default: 'dark',
    },
  },
  args: {
    title: 'Your Assets',
    accounts: mockAccounts,
  },
};

export default meta;

type Story = StoryObj<typeof AssetCard>;

// Default example with InfoButton
export const Default: Story = {
  args: {
    title: 'Your Assets',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default AssetCard with automatic InfoButton that provides information about the shielded portfolio.'
      }
    }
  }
};

// Example without InfoButton
export const WithoutInfoButton: Story = {
  args: {
    title: 'Your Assets',
    showInfoButton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AssetCard with InfoButton turned off by setting showInfoButton to false.'
      }
    }
  }
};

