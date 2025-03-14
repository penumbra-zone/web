import type { Meta, StoryObj } from '@storybook/react';

import { create } from '@bufbuild/protobuf';

import { ValueViewComponent } from '.';
import {
  MetadataSchema,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AmountSchema } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

const meta: Meta<typeof ValueViewComponent> = {
  component: ValueViewComponent,
  title: 'ValueViewComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ValueViewComponent>;

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

const EXAMPLE_VALUE = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: create(AmountSchema, {
        lo: 17000000n,
      }),
      metadata: EXAMPLE_METADATA,
    },
  },
});

export const Basic: Story = {
  args: {
    view: EXAMPLE_VALUE,
  },
};

export const NoValue: Story = {
  args: {
    view: EXAMPLE_VALUE,
    showValue: false,
  },
};

export const NoIcon: Story = {
  args: {
    view: EXAMPLE_VALUE,
    showIcon: false,
  },
};

export const NoDenom: Story = {
  args: {
    view: EXAMPLE_VALUE,
    showDenom: false,
  },
};
