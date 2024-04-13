import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui/components/ui/table';
import { Link } from 'react-router-dom';
import { shorten } from '@penumbra-zone/types/src/string';
import { useStore } from '../../state';
import { memo, useEffect } from 'react';
import { TransactionSummary } from '../../state/transactions';

export default function TransactionTable() {
  const { summaries, loadSummaries } = useStore(store => store.transactions);

  useEffect(() => void loadSummaries(), [loadSummaries]);

  return (
    <Table className='md:table'>
      <TableHeader className='hidden md:table-header-group'>
        <TableRow>
          <TableHead className='text-center'>Block Height</TableHead>
          <TableHead className='text-center'>Description</TableHead>
          <TableHead className='text-center'>Transaction Hash</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaries.map(summary => (
          <Row key={summary.hash} summary={summary} />
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Split into a separate component so that we can use `memo`, which prevents
 * rows from re-rendering just because other rows have been added.
 */
const Row = memo(({ summary }: { summary: TransactionSummary }) => (
  <TableRow>
    <TableCell>
      <p className='text-center text-base font-bold'>{summary.height}</p>
    </TableCell>
    <TableCell>
      <p className='text-center text-base font-bold'>{summary.description}</p>
    </TableCell>
    <TableCell>
      <p className='text-center font-mono text-base'>
        <Link to={`/tx/${summary.hash}`}>{shorten(summary.hash, 8)}</Link>
      </p>
    </TableCell>
    <TableCell className='hidden md:table-cell'>
      <Link to={`/tx/${summary.hash}`}>
        <img src='./more.svg' className='size-4 cursor-pointer hover:opacity-50' alt='More' />
      </Link>
    </TableCell>
  </TableRow>
));

Row.displayName = 'Row';
