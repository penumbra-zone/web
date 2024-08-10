import type { Meta, StoryObj } from '@storybook/react';

import { AccountSelector } from '.';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Text } from '../Text';
import styled from 'styled-components';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
`;

const mockGetAddressByIndex = (): Promise<Address> =>
  new Promise(resolve => setTimeout(() => resolve(new Address({ inner: u8(80) })), 1000));

const meta: Meta<typeof AccountSelector> = {
  component: AccountSelector,
  tags: ['autodocs', '!dev'],
  argTypes: {
    filter: { control: false },
    value: { control: false }, // For Storybook, we're leaving this uncontrolled
  },
};
export default meta;

type Story = StoryObj<typeof AccountSelector>;

export const WithAddress: Story = {
  tags: ['density'],
  args: {
    /**
     * Storybook automatically adds handlers for `on*` handlers. That has a
     * material effect on `<AccountSelector />`, since it can be either a
     * controlled or uncontrolled component, based on whether `onChange` is
     * defined. So we'll explicitly set `onChange` to `undefined` here to leave
     * it uncontrolled in Storybook.
     */
    onChange: undefined,
    getAddressByIndex: mockGetAddressByIndex,
    filter: [0, 1, 2, 3, 4],
  },
  decorators: [
    Story => (
      <Column>
        <Text>
          Note that, for the sake of this Storybook story, a random series of bytes is generated for
          the addresses. Thus, they are non-deterministic: if you select account #0, then #1, then
          back to #0, the 0th address will be different the second time around than it was the first
          time. In a real-world scenario, they <Text strong>are</Text> deterministic: for the same
          address index, the (non-ephemeral) address will always be the same.
        </Text>
        <Text>
          Also, note that, to simulate loading times, there is a one-second delay on calculating the
          address for a given address index. Real-world loading times will likely be faster, but
          this allows users to see the loading state.
        </Text>
        <Text>
          Lastly, for the sake of this Storybook story, a filter has been applied that limits the
          user to selecting the first 5 accounts (indexes 0-4).
        </Text>

        <Story />
      </Column>
    ),
  ],
};

export const WithoutAddress: Story = {
  args: {
    onChange: undefined,
  },
};
