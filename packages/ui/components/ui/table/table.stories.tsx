import type { Meta, StoryObj } from '@storybook/react';

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '.';

const meta: Meta<typeof Table> = {
  component: Table,
  title: 'Table',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Full: Story = {
  args: {},
  render: args => {
    return (
      <Table {...args}>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Block Height</TableHead>
            <TableHead className='text-center'>Description</TableHead>
            <TableHead className='text-center'>Transaction Hash</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <p className='text-center text-base font-bold'>10000</p>
              <p className='text-center text-base font-bold'>Some description</p>
              <p className='text-center text-base font-bold'>hash</p>
              <p className='text-center text-base font-bold'>Action</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  },
};
