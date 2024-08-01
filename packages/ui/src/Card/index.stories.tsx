import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '.';

import storiesBg from './storiesBg.jpg';
import styled from 'styled-components';
import { Text } from '../Text';

const BgWrapper = styled.div`
  padding: ${props => props.theme.spacing(20)};
  position: relative;

  &::before {
    content: '';
    background: url(${storiesBg}) center / cover;
    opacity: 0.6;
    filter: blur(4px);
    position: absolute;
    inset: 0;
    z-index: -1;
  }
`;

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs', '!dev'],
  decorators: [
    Story => (
      <BgWrapper>
        <Story />
      </BgWrapper>
    ),
  ],
  argTypes: {
    as: {
      options: ['section', 'div', 'main'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: {
    as: 'section',
    title: 'Card title',
  },

  render: function Render({ as, title }) {
    return (
      <Card as={as} title={title}>
        <Text p>This is the card content.</Text>
        <Text p>Here is some more content.</Text>
      </Card>
    );
  },
};
