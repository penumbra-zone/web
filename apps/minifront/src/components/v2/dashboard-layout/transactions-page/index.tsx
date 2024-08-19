import { Table } from '@repo/ui/Table';
import { useSummaries } from '../../../../state/transactions';
import { Text } from '@repo/ui/Text';
import { Link } from 'react-router-dom';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '@repo/ui/Button';
import { useAnimationDeferredValue } from '@repo/ui/hooks/useAnimationDeferredValue';
import { LayoutGroup } from 'framer-motion';

export const TransactionsPage = () => {
  const summaries = useSummaries();
  const deferredSummariesData = useAnimationDeferredValue(summaries.data);

  return (
    <LayoutGroup id='dashboardContent'>
      <Table tableLayout='fixed' motion={{ layoutId: 'table' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th width='150px' motion={{ layoutId: 'th1' }}>
              Block Height
            </Table.Th>
            <Table.Th motion={{ layoutId: 'th2' }}>Description</Table.Th>
            <Table.Th width='125px' motion={{ layoutId: 'th3' }}>
              Hash
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {deferredSummariesData?.map(summary => (
            <Table.Tr key={summary.hash}>
              <Table.Td>
                <Text>{summary.height}</Text>
              </Table.Td>
              <Table.Td>
                <Text>{summary.description}</Text>
              </Table.Td>
              <Table.Td>
                <div className='flex gap-1'>
                  <Link
                    to={`/tx/${summary.hash}`}
                    className='shrink overflow-hidden'
                    title={summary.hash}
                  >
                    <Text truncate as='div'>
                      {summary.hash}
                    </Text>
                  </Link>
                  <Link to={`/tx/${summary.hash}`}>
                    <Button icon={SquareArrowOutUpRight} iconOnly='adornment'>
                      View transaction
                    </Button>
                  </Link>
                </div>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </LayoutGroup>
  );
};
