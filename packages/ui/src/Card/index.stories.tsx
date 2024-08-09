import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '.';

import storiesBg from './storiesBg.jpg';
import styled from 'styled-components';
import { Text } from '../Text';
import { FormField } from '../FormField';
import { TextInput } from '../TextInput';
import { useState } from 'react';
import { Button } from '../Button';
import { Tabs } from '../Tabs';
import { Send } from 'lucide-react';

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
    const [tab, setTab] = useState('one');
    const [textInput, setTextInput] = useState('');

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
          <Card.Section>
            <FormField
              label='Sample form field'
              helperText="Here's an example of a form field inside a card section."
            >
              <TextInput
                value={textInput}
                onChange={setTextInput}
                placeholder='Type something...'
              />
            </FormField>
          </Card.Section>
        </Card.Stack>
        <Button actionType='accent' icon={Send}>
          Send
        </Button>
      </Card>
    );
  },
};
