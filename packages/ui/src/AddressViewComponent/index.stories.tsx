import type { Meta, StoryObj } from '@storybook/react';

import { AddressViewComponent } from '.';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb.js';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';
import styled from 'styled-components';

const EXAMPLE_VIEW_DECODED = new AddressView({
  addressView: {
    case: 'decoded',

    value: {
      address: { inner: new Uint8Array(80) },
      index: {
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      },
    },
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

const MaxWidthWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

const meta: Meta<typeof AddressViewComponent> = {
  component: AddressViewComponent,
  tags: ['autodocs', '!dev'],
  argTypes: {
    addressView: {
      options: ['Sample decoded address view', 'Sample opaque address view'],
      mapping: {
        'Sample decoded address view': EXAMPLE_VIEW_DECODED,
        'Sample opaque address view': EXAMPLE_VIEW_OPAQUE,
      },
    },
  },
  decorators: [
    Story => (
      <MaxWidthWrapper>
        <Story />
      </MaxWidthWrapper>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof AddressViewComponent>;

export const Basic: Story = {
  args: {
    addressView: EXAMPLE_VIEW_DECODED,
    copyable: true,
  },
};
