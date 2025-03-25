import type { Meta, StoryObj } from '@storybook/react';

import { create } from '@bufbuild/protobuf';

import { AddressViewComponent } from '.';

import {
  AddressSchema,
  AddressIndexSchema,
  AddressViewSchema,
  AddressView_DecodedSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

const meta: Meta<typeof AddressViewComponent> = {
  component: AddressViewComponent,
  title: 'AddressViewComponent',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AddressViewComponent>;

const EXAMPLE_VIEW = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',

    value: create(AddressView_DecodedSchema, {
      address: create(AddressSchema, { inner: new Uint8Array(80) }),
      index: create(AddressIndexSchema, {
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      }),
    }),
  },
});

const EXAMPLE_VIEW_OPAQUE = create(AddressViewSchema, {
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
    copyable: false,
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
