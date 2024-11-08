import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { TextInput } from '.';
import { Icon } from '../Icon';
import { BookUser, Send } from 'lucide-react';
import { Button } from '../Button';
import { Density } from '../Density';

const SampleButton = () => (
  <Density compact>
    <Button icon={Send} iconOnly>
      Validate
    </Button>
  </Density>
);

const addressBookIcon = (
  <Icon IconComponent={BookUser} size='sm' color={color => color.text.primary} />
);

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  tags: ['autodocs', '!dev'],
  argTypes: {
    startAdornment: {
      options: ['Address book icon', 'None'],
      mapping: {
        'Address book icon': addressBookIcon,
        None: undefined,
      },
    },
    endAdornment: {
      options: ['Sample button', 'None'],
      mapping: {
        'Sample button': <SampleButton />,
        None: undefined,
      },
    },
    max: { control: false },
    min: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const Basic: Story = {
  args: {
    actionType: 'default',
    placeholder: 'penumbra1abc123...',
    value: '',
    disabled: false,
    type: 'text',
    startAdornment: addressBookIcon,
    endAdornment: <SampleButton />,
  },

  render: function Render(props) {
    const [, updateArgs] = useArgs();

    const onChange = (value: string) => updateArgs({ value });

    return <TextInput {...props} onChange={onChange} />;
  },
};
