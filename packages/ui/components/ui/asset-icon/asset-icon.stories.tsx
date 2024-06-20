import type { Meta, StoryObj } from '@storybook/react';

import { AssetIcon } from '.';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

const meta: Meta<typeof AssetIcon> = {
  component: AssetIcon,
  title: 'AssetIcon',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AssetIcon>;

const EXAMPLE_METADATA = new Metadata({
  base: 'upenumbra',
  display: 'penumbra',
  symbol: 'UM',
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const Small: Story = {
  args: {
    metadata: EXAMPLE_METADATA,
  },
};

export const ExtraSmall: Story = {
  args: {
    metadata: EXAMPLE_METADATA,
    size: 'xs',
  },
};

export const Large: Story = {
  args: {
    metadata: EXAMPLE_METADATA,
    size: 'lg',
  },
};
