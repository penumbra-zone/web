import type { Meta, StoryObj } from '@storybook/react';

import { AddressViewComponent } from '.';
import {
  Address,
  AddressIndex,
  AddressView,
  AddressView_Decoded,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

const meta: Meta<typeof AddressViewComponent> = {
  component: AddressViewComponent,
  title: 'AddressViewComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AddressViewComponent>;

const EXAMPLE_VIEW = new AddressView({
  addressView: {
    case: 'decoded',

    value: new AddressView_Decoded({
      address: new Address({ inner: new Uint8Array(80) }),
      index: new AddressIndex({
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      }),
    }),
  },
});

const EXAMPLE_VIEW_OPAQUE = new AddressView({
  addressView: {
    case: 'opaque',
    value: {
      address: addressFromBech32m(
        'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
      ),
    },
  },
});

export const Decoded: Story = {
  args: {
    view: EXAMPLE_VIEW,
  },
};

export const Copiable: Story = {
  args: {
    view: EXAMPLE_VIEW,
    copyable: true,
  },
};

export const Opaque: Story = {
  args: {
    view: EXAMPLE_VIEW_OPAQUE,
  },
};
