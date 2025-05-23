import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  CardProps,
} from '.';

const meta: Meta<CardProps> = {
  component: Card,
  title: 'Card',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<CardProps>;

export const Basic: Story = {
  args: {
    children: 'Save',
  },
};

export const Gradient: Story = {
  args: {
    children: 'Save',
    gradient: true,
  },
};

export const Light: Story = {
  args: {
    children: 'Save',
    light: true,
  },
};

export const Full: StoryObj<React.ComponentProps<typeof Card>> = {
  args: {},
  render: args => {
    return (
      <Card {...args}>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardDescription>Card Description</CardDescription>
        <CardContent>This is content</CardContent>
        <CardFooter>Card footer</CardFooter>
      </Card>
    );
  },
};
