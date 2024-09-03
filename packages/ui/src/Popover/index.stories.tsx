import type { Meta, StoryObj } from '@storybook/react';

import { Popover } from '.';
import { Button } from '../Button';
import { ComponentType, useState } from 'react';
import { Text } from '../Text';
import styled from 'styled-components';
import { Shield } from 'lucide-react';
import { Density } from '../Density';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing(4)};
  color: ${props => props.theme.color.text.primary};
`;

const meta: Meta<typeof Popover> = {
  component: Popover,
  tags: ['autodocs', '!dev'],
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
  },
  subcomponents: {
    // Re: type coercion, see
    // https://github.com/storybookjs/storybook/issues/23170#issuecomment-2241802787
    'Popover.Content': Popover.Content as ComponentType<unknown>,
    'Popover.Trigger': Popover.Trigger as ComponentType<unknown>,
  },
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Basic: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Popover.Trigger>
          <Button onClick={() => setIsOpen(true)}>Open popover</Button>
        </Popover.Trigger>

        <Popover.Content>
          <Wrapper>
            <Text body as='h3'>
              This is a heading
            </Text>
            <Text small>
              This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Ut et massa mi.
            </Text>
            <div>
              <Density compact>
                <Button icon={Shield} onClick={() => setIsOpen(false)}>
                  Action
                </Button>
              </Density>
            </div>
          </Wrapper>
        </Popover.Content>
      </Popover>
    );
  },
};
