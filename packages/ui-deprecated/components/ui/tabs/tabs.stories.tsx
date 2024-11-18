import type { Meta, StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';
import { useState } from 'react';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Tabs',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Full: Story = {
  args: {
    defaultValue: 'one',
  },
  render: args => {
    const [active, setActive] = useState(args.defaultValue);

    return (
      <Tabs {...args} value={active} onValueChange={setActive}>
        <TabsList>
          <TabsTrigger value='one'>One</TabsTrigger>
          <TabsTrigger value='two'>Two</TabsTrigger>
          <TabsTrigger value='three'>Three</TabsTrigger>
        </TabsList>
        <TabsContent value='one'>Content for one</TabsContent>
        <TabsContent value='two'>Content for two</TabsContent>
        <TabsContent value='three'>Content for three</TabsContent>
      </Tabs>
    );
  },
};
