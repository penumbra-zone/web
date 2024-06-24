import type { Meta, StoryObj } from '@storybook/react';

import { ValueViewComponent } from '.';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

const meta: Meta<typeof ValueViewComponent> = {
  component: ValueViewComponent,
  title: 'ValueViewComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ValueViewComponent>;

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

const EXAMPLE_VALUE = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: new Amount({
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
