import type { Meta, StoryObj } from '@storybook/react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { TransactionSummary } from '.';
import {
  registry,
  TxSwap,
  TxIbcRelay,
  TxReceive,
  TxPositionOpen,
  TxDelegate,
  TxMultiAsset,
} from '../utils/bufs';

const OPTIONS: Record<string, TransactionInfo> = {
  'Swap Tx': TxSwap,
  'Deposit Tx': TxIbcRelay,
  'Receive Tx': TxReceive,
  'PositionOpen Tx': TxPositionOpen,
  'Delegate Tx': TxDelegate,
  'Multi-Asset Tx': TxMultiAsset,
};

const meta: Meta<typeof TransactionSummary> = {
  component: TransactionSummary,
  tags: ['autodocs', '!dev', 'density'],
  parameters: {
    docs: {
      description: {
        component: `
A comprehensive component for displaying transaction summaries with dynamic balance change truncation.

**Key Features:**
- **Dynamic Truncation**: Balance changes are automatically truncated based on available container width
- **Ellipsis Popover**: When balance changes exceed available space, an ellipsis (⋯) button appears
- **Responsive**: Uses ResizeObserver to adjust visible balance changes when container size changes
- **Click to Expand**: Clicking the ellipsis shows a popover with all balance changes in a vertical list

**Popover Behavior:**
The ellipsis button only appears when there are more balance changes than can fit in the available space. The popover displays all balance changes for that address and automatically sizes to fit the content.
        `,
      },
    },
  },
  argTypes: {
    info: {
      options: Object.keys(OPTIONS),
      mapping: OPTIONS,
    },
    hideMemo: {
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default meta;

type Story = StoryObj<typeof TransactionSummary>;

export const Basic: Story = {
  args: {
    info: TxSwap,
    getMetadata: registry.tryGetMetadata,
    hideMemo: false,
  },
};

export const DelegationTransaction: Story = {
  args: {
    info: TxDelegate,
    getMetadata: registry.tryGetMetadata,
    hideMemo: false,
  },
};

export const MultiAssetTransaction: Story = {
  name: 'Multi-Asset with Ellipsis Popover',
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the ellipsis popover functionality. The transaction has multiple balance changes (4 assets), 
and depending on the container width, some may be truncated with an ellipsis button.

**Try this:** 
1. Resize the container to see how balance changes dynamically truncate
2. Click the ellipsis (⋯) button to see all balance changes in a popover
3. The popover content automatically sizes to fit without fixed widths
        `,
      },
    },
  },
  args: {
    info: TxMultiAsset,
    getMetadata: registry.tryGetMetadata,
    hideMemo: false,
  },
};
