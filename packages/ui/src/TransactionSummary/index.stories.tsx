import type { Meta, StoryObj } from '@storybook/react';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { TransactionSummary } from '.';
import { registry, TxInfo } from '../utils/bufs';

const OPTIONS: Record<string, TransactionInfo> = {
  'Transaction Summary': TxInfo,
};

const meta: Meta<typeof TransactionSummary> = {
  component: TransactionSummary,
  tags: ['autodocs', '!dev'],
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
    info: TxInfo,
    getMetadataByAssetId: registry.tryGetMetadata,
  },
};
