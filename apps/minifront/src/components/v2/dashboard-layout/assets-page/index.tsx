import { Table } from '@repo/ui/Table';

export const AssetsPage = () => (
  <div className='flex flex-col gap-1'>
    <Table title={<div>Account #1</div>}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Asset</Table.Th>
          <Table.Th>Estimate</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        <Table.Tr>
          <Table.Td>test</Table.Td>
          <Table.Td>test</Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  </div>
);
