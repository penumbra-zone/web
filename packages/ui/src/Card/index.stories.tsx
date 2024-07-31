import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '.';

import storiesBg from './storiesBg.png';
import styled from 'styled-components';
import { Text } from '../Text';
import { Tabs } from '../Tabs';
import { useState } from 'react';

const BgWrapper = styled.div`
  background: ${props => props.theme.color.base.black};
  padding: ${props => props.theme.spacing(20)};
  position: relative;

  &::before {
    content: '';
    background: url(${storiesBg}) center / cover;
    opacity: 0.4;
    filter: blur(4px);
    position: absolute;
    inset: 0;
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
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  args: {
    as: 'div',
  },

  render: function Render({ as }) {
    const [selectedTab, setSelectedTab] = useState('one');

    return (
      <Card as={as} title='Card Title'>
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          options={[
            {
              label: 'One',
              value: 'one',
            },
            {
              label: 'Two',
              value: 'two',
            },
          ]}
        />
        <Text p>This is the card content.</Text>
        <Text p>Here is some more content.</Text>
      </Card>
    );
  },
};
