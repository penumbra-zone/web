import type { Meta, StoryObj } from '@storybook/react';

import { create } from '@bufbuild/protobuf';

import { AssetIcon } from '.';
import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const meta: Meta<typeof AssetIcon> = {
  component: AssetIcon,
  title: 'AssetIcon',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AssetIcon>;

const EXAMPLE_METADATA = create(MetadataSchema, {
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
