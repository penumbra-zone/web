import type { Meta, StoryObj } from '@storybook/react';

import { AddressViewComponent } from '.';
import { ADDRESS_VIEW_DECODED, ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_OPAQUE } from '../utils/bufs';

const meta: Meta<typeof AddressViewComponent> = {
  component: AddressViewComponent,
  tags: ['autodocs', '!dev', 'density'],
  argTypes: {
    addressView: {
      options: [
        'Decoded: main-account address view',
        'Decoded: sub-account address view',
        'Opaque: account address view',
      ],
      mapping: {
        'Decoded: main-account address view': ADDRESS_VIEW_DECODED,
        'Decoded: sub-account address view': ADDRESS1_VIEW_DECODED,
        'Opaque: account address view': ADDRESS_VIEW_OPAQUE,
      },
    },
  },
  decorators: [
    Story => (
      <div className='w-full overflow-hidden p-4'>
        <Story />
      </div>
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
