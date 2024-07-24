import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '.';
import { Text } from '../Text';

const meta: Meta<typeof Table> = {
  component: Table,
  tags: ['autodocs', '!dev'],
};
export default meta;

type Story = StoryObj<typeof Table>;

const DATA = [
  [32768, 'Send', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
  [16384, 'Receive', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
  [8192, 'Swap Claim', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
  [4096, 'Swap', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
  [2048, 'Internal Transfer', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
  [1024, 'Delegate', '9d80ffa9113f7eed74ddeff8eddfda6a89106c6cdf336565f9cbaf90810396bf'],
];

export const Basic: Story = {
  render: function Render() {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Block height</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Transaction hash</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {DATA.map(([blockHeight, description, hash]) => (
            <Table.Tr key={hash}>
              <Table.Td>{blockHeight}</Table.Td>
              <Table.Td>{description}</Table.Td>
              <Table.Td>
                <Text technical>{hash}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  },
};
