import type { Meta, StoryObj } from '@storybook/react';
// import { Density } from '../Density';
import { AssetCard } from './index';
import { mockAccounts } from './mock';
import { Coins, KeySquare, Shield } from 'lucide-react';
import { InfoButton } from '../InfoButton';
import { Button } from '../Button';

const meta: Meta<typeof AssetCard> = {
  component: AssetCard,
  tags: ['autodocs'],
  // Configure the docs page to be the default for this component
  parameters: {
    // This makes the docs page the default view when clicking on AssetCard
    viewMode: 'docs',
    backgrounds: {
      default: 'dark',
    },
  },
  // Include the default args directly in the meta
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

// Example with custom endContent
export const WithCustomEndContent: Story = {
  render: () => (
    <AssetCard
      title="Your Assets"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'AssetCard with custom endContent instead of the InfoButton. Custom endContent takes precedence over the InfoButton.'
      }
    }
  }
};

