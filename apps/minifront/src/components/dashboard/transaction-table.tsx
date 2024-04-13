import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@penumbra-zone/ui/components/ui/table';
import { Link, LoaderFunction } from 'react-router-dom';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client';
import { shorten } from '@penumbra-zone/types/src/string';
import { useStore } from '../../state';
import { useEffect } from 'react';

export const TxsLoader: LoaderFunction = async (): Promise<null> => {
  await throwIfPraxNotConnectedTimeout();
  return null;
};

export default function TransactionTable() {
  const { summaries, loadSummaries } = useStore(store => store.transactions);

  useEffect(() => void loadSummaries(), [loadSummaries]);

  return (
    <>
      <div className='flex flex-col gap-[34px] md:hidden'>
        {summaries.map((tx, i) => (
          <div key={i} className='flex justify-between gap-4 border-b pb-3'>
            <p className='text-center text-base font-bold'>{tx.height}</p>
            <p className='text-center text-base font-bold'>{tx.description}</p>
            <p className='text-center font-mono text-base'>
              <Link to={`/tx/${tx.hash}`}>{shorten(tx.hash, 8)}</Link>
            </p>
          </div>
        ))}
      </div>
      <Table className='hidden md:table'>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Block Height</TableHead>
            <TableHead className='text-center'>Description</TableHead>
            <TableHead className='text-center'>Transaction Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((tx, i) => (
            <TableRow key={i}>
              <TableCell>
                <p className='text-center text-base font-bold'>{tx.height}</p>
              </TableCell>
              <TableCell>
                <p className='text-center text-base font-bold'>{tx.description}</p>
              </TableCell>
              <TableCell>
                <p className='text-center font-mono text-base'>
                  <Link to={`/tx/${tx.hash}`}>{shorten(tx.hash, 8)}</Link>
                </p>
              </TableCell>
              <TableCell>
                <Link to={`/tx/${tx.hash}`}>
                  <img
                    src='./more.svg'
                    className='size-4 cursor-pointer hover:opacity-50'
                    alt='More'
                  />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
