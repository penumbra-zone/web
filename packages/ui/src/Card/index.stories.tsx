import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '.';

import { Text } from '../Text';
import { useState } from 'react';
import { Button } from '../Button';
import { Tabs } from '../Tabs';
import { Send, Coins, KeySquare, Shield } from 'lucide-react';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs', '!dev'],
  decorators: [
    Story => (
      <div
        className='text-text-primary -before:z-[1] before:bg-[url("https://images.unsplash.com/photo-1517405404692-6eddc8fb975f?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")] relative p-20 before:absolute before:inset-0 before:bg-caution-main before:opacity-60 before:blur-sm before:content-[""]'
        style={{}}
      >
        <Story />
      </div>
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
    const [tab, setTab] = useState('one');

    return (
      <Card as={as} title={title}>
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { label: 'One', value: 'one' },
            { label: 'Two', value: 'two' },
          ]}
        />

        <div>
          <Text p>
            This is the card content. Note that each top-level item inside the card is spaced apart
            with a spacing of <Text technical>4</Text>. Hence the distance between the tabs and this
            paragraph, and the distance between this paragraph and the stack below.
          </Text>
        </div>

        <Card.Stack>
          <Card.Section>
            <Text>
              This is a <Text technical>&lt;Card.Stack /&gt;</Text> comprised of several{' '}
              <Text technical>&lt;Card.Section /&gt;</Text>s. Note that the top and bottom of the
              entire stack have rounded corners.
            </Text>
          </Card.Section>
          <Card.Section>
            <Text>
              Card sections in a stack are useful for forms: each field of the form can be wrapped
              in a <Text technical>&lt;Card.Section /&gt;</Text>.
            </Text>
          </Card.Section>
        </Card.Stack>
        <Button actionType='accent' icon={Send}>
          Send
        </Button>
      </Card>
    );
  },
};

export const WithEndContent: Story = {
  args: {
    as: 'section',
    title: 'Your Assets',
    endContent: 'info',
  },
  render: function Render({ as, title, endContent }) {
    return (
      <Card as={as} title={title} endContent={endContent}>
        <Card.Stack>
          <Card.Section>
            <Text>
              This card demonstrates the use of the InfoButton component in the endContent position.
              Click on the shield icon to see more information about your assets.
            </Text>
          </Card.Section>
          <Card.Section>
            <Text>
              The endContent prop allows placing any content next to the title, creating a clean and
              consistent UI.
            </Text>
          </Card.Section>
        </Card.Stack>
      </Card>
    );
  },
};
