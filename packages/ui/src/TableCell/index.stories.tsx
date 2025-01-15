import type { Meta, StoryObj } from '@storybook/react';

import { TableCell } from '.';
import { Pill } from '../Pill';

const meta: Meta<typeof TableCell> = {
  component: TableCell,
  tags: ['autodocs', '!dev', 'density'],
};
export default meta;

type Story = StoryObj<typeof TableCell>;

export const Basic: Story = {
  render: function Render() {
    return (
      <div className='grid grid-cols-5'>
        <div className='col-span-5 grid grid-cols-subgrid'>
          <TableCell heading>Name</TableCell>
          <TableCell heading>Loading</TableCell>
          <TableCell heading>Price</TableCell>
          <TableCell heading>Amount</TableCell>
          <TableCell heading>Number</TableCell>
        </div>
        <div className='col-span-5 grid grid-cols-subgrid'>
          <TableCell cell>Hello</TableCell>
          <TableCell cell loading={true}>
            World
          </TableCell>
          <TableCell cell>What</TableCell>
          <TableCell cell>
            <Pill>Pending</Pill>
          </TableCell>
          <TableCell cell numeric>
            11.1111
          </TableCell>
        </div>
        <div className='col-span-5 grid grid-cols-subgrid'>
          <TableCell footer>Hello</TableCell>
          <TableCell footer loading={true}>
            World
          </TableCell>
          <TableCell footer>What</TableCell>
          <TableCell footer>
            <Pill>Pending</Pill>
          </TableCell>
          <TableCell footer numeric>
            88.2222
          </TableCell>
        </div>
      </div>
    );
  },
};
