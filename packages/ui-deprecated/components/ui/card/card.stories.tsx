import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '.';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'Card',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

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

export const Full: Story = {
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
