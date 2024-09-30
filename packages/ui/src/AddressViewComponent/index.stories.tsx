import type { Meta, StoryObj } from '@storybook/react';

import { AddressViewComponent } from '.';
import { styled } from 'styled-components';
import { ADDRESS_VIEW_DECODED, ADDRESS_VIEW_OPAQUE } from '../utils/bufs';

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
        'Sample decoded address view': ADDRESS_VIEW_DECODED,
        'Sample opaque address view': ADDRESS_VIEW_OPAQUE,
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
    addressView: ADDRESS_VIEW_DECODED,
    copyable: true,
  },
};
