import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '.';

const meta: Meta<typeof Table> = {
  component: Table,
  tags: ['autodocs', '!dev'],
  argTypes: {
    thead: { control: false },
    tbody: { control: false },
    tfoot: { control: false },
    tr: { control: false },
    th: { control: false },
    td: { control: false },
  },
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
        <Table thead>
          <Table tr>
            <Table th>Block height</Table>
            <Table th>Description</Table>
            <Table th>Transaction hash</Table>
          </Table>
        </Table>
        <Table tbody>
          {DATA.map(([blockHeight, description, hash]) => (
            <Table tr key={hash}>
              <Table td>{blockHeight}</Table>
              <Table td>{description}</Table>
              <Table td>{hash}</Table>
            </Table>
          ))}
        </Table>
      </Table>
    );
  },
};
