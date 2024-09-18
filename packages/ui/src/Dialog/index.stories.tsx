import type { Meta, StoryObj } from '@storybook/react';

import { Dialog } from '.';
import { Button } from '../Button';
import { ComponentType } from 'react';
import { Text } from '../Text';
import styled from 'styled-components';
import { Ban, Handshake, ThumbsUp } from 'lucide-react';

const WhiteTextWrapper = styled.div`
  color: ${props => props.theme.color.text.primary};
`;

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  tags: ['autodocs', '!dev'],
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
  },
  subcomponents: {
    // Re: type coercion, see
    // https://github.com/storybookjs/storybook/issues/23170#issuecomment-2241802787
    'Dialog.Content': Dialog.Content as ComponentType<unknown>,
    'Dialog.Trigger': Dialog.Trigger as ComponentType<unknown>,
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  render: function Render() {
    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button>Open dialog</Button>
        </Dialog.Trigger>

        <Dialog.Content
          title='This is the heading'
          buttonGroupProps={{
            buttons: [
              { label: 'Primary CTA', icon: ThumbsUp },
              { label: 'Secondary CTA', icon: Handshake },
              { label: 'Another secondary CTA', icon: Ban },
            ],
            hasPrimaryButton: true,
          }}
        >
          <WhiteTextWrapper>
            <Text large as='h3'>
              This is a subheading
            </Text>
            <Text p>
              This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Ut et massa mi.
            </Text>
            <Text large as='h3'>
              This is a subheading
            </Text>
            <Text p>
              This is description information. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Ut et massa mi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
              massa mi.
            </Text>
          </WhiteTextWrapper>
        </Dialog.Content>
      </Dialog>
    );
  },
};
