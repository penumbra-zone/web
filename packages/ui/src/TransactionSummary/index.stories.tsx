import type { Meta, StoryObj } from '@storybook/react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { TransactionSummary } from '.';
import { registry, TxSwap, TxIbcRelay, TxReceive, TxPositionOpen } from '../utils/bufs';

const OPTIONS: Record<string, TransactionInfo> = {
  'Swap Tx': TxSwap,
  'Deposit Tx': TxIbcRelay,
  'Receive Tx': TxReceive,
  'PositionOpen Tx': TxPositionOpen,
};

const meta: Meta<typeof TransactionSummary> = {
  component: TransactionSummary,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    info: {
      options: Object.keys(OPTIONS),
      mapping: OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<typeof TransactionSummary>;

export const Basic: Story = {
  args: {
    info: TxSwap,
    getMetadataByAssetId: registry.tryGetMetadata,
  },
};
