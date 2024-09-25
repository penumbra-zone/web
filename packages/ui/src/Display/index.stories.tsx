import type { Meta, StoryObj } from '@storybook/react';

import { Display } from '.';
import { styled } from 'styled-components';
import { Text } from '../Text';

const meta: Meta<typeof Display> = {
  component: Display,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
  decorators: [
    Story => (
      <OuterWidthIndicator>
        <Story />
      </OuterWidthIndicator>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Display>;

const OuterWidthIndicator = styled.div`
  border: 1px solid ${props => props.theme.color.base.white};
`;

const InnerWidthIndicator = styled.div`
  background: ${props => props.theme.color.base.white};
  color: ${props => props.theme.color.base.black};
  padding: ${props => props.theme.spacing(2)};
`;

export const FullWidth: Story = {
  args: {
    children: (
      <InnerWidthIndicator>
        <Text p>
          The white background that this text sits inside of represents the{' '}
          <Text strong>inside</Text> width of the <Text technical>&lt;Display /&gt;</Text>{' '}
          component. The white border to the left and right of this white bar represent the{' '}
          <Text strong>outside</Text> width of the <Text technical>&lt;Display /&gt;</Text>{' '}
          component.
        </Text>
        <Text p>
          You can resize your window to see how the margins at left and right change depending on
          the size of the browser window.
        </Text>
        <Text p>
          To test <Text technical>&lt;Display /&gt;</Text> at full width, click the &quot;Full
          Width&quot; item in the left sidebar, and try resizing your browser.
        </Text>
      </InnerWidthIndicator>
    ),
  },
};
