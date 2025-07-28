import type { Meta, StoryObj } from '@storybook/react';

import { IconAdornment } from '.';
import { Shield, Heart, Star, Copy, Settings, ArrowLeft, Check } from 'lucide-react';

const meta: Meta<typeof IconAdornment> = {
  component: IconAdornment,
  tags: ['autodocs', '!dev'],
  argTypes: {
    icon: {
      control: 'select',
      options: ['Shield', 'Heart', 'Star', 'Copy', 'Settings', 'ArrowLeft', 'Check'],
      mapping: { Shield, Heart, Star, Copy, Settings, ArrowLeft, Check },
    },
    size: {
      control: 'radio',
      options: ['sm', 'xs'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof IconAdornment>;

export const Basic: Story = {
  args: {
    icon: Shield,
    size: 'sm',
    disabled: false,
  },
};

export const Small: Story = {
  args: {
    icon: Shield,
    size: 'sm',
    disabled: false,
  },
};

export const ExtraSmall: Story = {
  args: {
    icon: Shield,
    size: 'xs',
    disabled: false,
  },
};

export const Interactive: Story = {
  args: {
    icon: Heart,
    size: 'sm',
    disabled: false,
    onClick: () => alert('IconAdornment clicked!'),
  },
};

export const Disabled: Story = {
  args: {
    icon: Settings,
    size: 'sm',
    disabled: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' />
        <span className='text-xs text-text-secondary'>sm (24×24)</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='xs' />
        <span className='text-xs text-text-secondary'>xs (12×12)</span>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className='grid grid-cols-5 gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' />
        <span className='text-xs text-text-secondary'>Default</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Hover (Interactive)</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Pressed (Click)</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' disabled />
        <span className='text-xs text-text-secondary'>Disabled</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Focus (Tab)</span>
      </div>
    </div>
  ),
};

export const ActionTypes: Story = {
  render: () => (
    <div className='grid grid-cols-5 gap-4'>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Shield} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Default</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Star} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Accent</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={ArrowLeft} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Unshield</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Copy} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Destructive</span>
      </div>
      <div className='flex flex-col items-center gap-2'>
        <IconAdornment icon={Check} size='sm' onClick={() => {}} />
        <span className='text-xs text-text-secondary'>Success</span>
      </div>
    </div>
  ),
};
