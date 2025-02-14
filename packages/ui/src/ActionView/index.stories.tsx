import type { Meta, StoryObj } from '@storybook/react';
import { ActionView as ActionViewMessage } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

import { ActionView } from '.';
import {
  SpendAction,
  OutputAction,
  SwapAction,
  SpendActionOpaque,
  OutputActionOpaque,
  SwapActionOpaque,
  SwapClaimAction,
} from '../utils/bufs';

const OPTIONS: Record<string, ActionViewMessage> = {
  Spend: SpendAction,
  Output: OutputAction,
  Swap: SwapAction,
  SwapClaim: SwapClaimAction,
  'Opaque: Spend': SpendActionOpaque,
  'Opaque: Output': OutputActionOpaque,
  'Opaque: Swap': SwapActionOpaque,
};

const meta: Meta<typeof ActionView> = {
  component: ActionView,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    action: {
      options: Object.keys(OPTIONS),
      mapping: OPTIONS,
    },
  },
};
export default meta;

type Story = StoryObj<typeof ActionView>;

export const Basic: Story = {
  args: {
    action: SpendAction,
  },
};
