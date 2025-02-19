import type { Meta, StoryObj } from '@storybook/react';

import { PENUMBRA_METADATA, PIZZA_METADATA, USDC_METADATA } from '../utils/bufs';
import { AssetGroup } from '.';

const meta: Meta<typeof AssetGroup> = {
  title: 'AssetIcon/Group',
  component: AssetGroup,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof AssetGroup>;

export const Overlay: Story = {
  args: {
    size: 'md',
    variant: 'overlay',
    assets: [PENUMBRA_METADATA, PIZZA_METADATA, USDC_METADATA],
  },
};

export const Split: Story = {
  args: {
    size: 'md',
    variant: 'split',
    assets: [PENUMBRA_METADATA, USDC_METADATA],
  },
};
