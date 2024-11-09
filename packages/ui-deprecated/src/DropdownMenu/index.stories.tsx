import type { Meta, StoryObj } from '@storybook/react';

import { DropdownMenu } from '.';
import { Button } from '../Button';
import { ComponentType, useState } from 'react';
import { Filter } from 'lucide-react';

const meta: Meta<typeof DropdownMenu> = {
  component: DropdownMenu,
  tags: ['autodocs', '!dev'],
  argTypes: {
    isOpen: { control: false },
    onClose: { control: false },
  },
  subcomponents: {
    // Re: type coercion, see
    // https://github.com/storybookjs/storybook/issues/23170#issuecomment-2241802787
    'DropdownMenu.Content': DropdownMenu.Content as ComponentType<unknown>,
    'DropdownMenu.Trigger': DropdownMenu.Trigger as ComponentType<unknown>,
    'DropdownMenu.RadioGroup': DropdownMenu.RadioGroup as ComponentType<unknown>,
    'DropdownMenu.RadioItem': DropdownMenu.RadioItem as ComponentType<unknown>,
    'DropdownMenu.CheckboxItem': DropdownMenu.CheckboxItem as ComponentType<unknown>,
    'DropdownMenu.Item': DropdownMenu.Item as ComponentType<unknown>,
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Basic: Story = {
  render: function Render() {
    return (
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button iconOnly icon={Filter}>
            Filter
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.Item actionType='destructive'>Destructive</DropdownMenu.Item>
          <DropdownMenu.Item actionType='accent'>Accent</DropdownMenu.Item>
          <DropdownMenu.Item actionType='unshield'>Unshield</DropdownMenu.Item>
          <DropdownMenu.Item actionType='default'>Default</DropdownMenu.Item>
          <DropdownMenu.Item actionType='default' disabled>
            Disabled
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  },
};

export const Radio: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState('1');

    return (
      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DropdownMenu.Trigger>
          <Button onClick={() => setIsOpen(true)} iconOnly icon={Filter}>
            Filter
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup value={value} onChange={setValue}>
            <DropdownMenu.RadioItem actionType='destructive' value='1'>
              Destructive
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem actionType='accent' value='2'>
              Accent
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem actionType='unshield' value='3'>
              Unshield
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem actionType='default' value='4'>
              Default
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem actionType='default' value='5' disabled>
              Disabled
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  },
};

export const Checkbox: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    const [apple, setApple] = useState(false);
    const [banana, setBanana] = useState(false);

    return (
      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DropdownMenu.Trigger>
          <Button onClick={() => setIsOpen(true)} iconOnly icon={Filter}>
            Filter
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          <DropdownMenu.CheckboxItem checked={apple} onChange={setApple}>
            Apple
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem checked={banana} onChange={setBanana}>
            Banana
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    );
  },
};
