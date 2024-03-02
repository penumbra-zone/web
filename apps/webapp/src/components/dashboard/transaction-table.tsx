import { shorten } from '@penumbra-zone/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { Link, LoaderFunction, useLoaderData } from 'react-router-dom';
import { getAllTransactions, TransactionSummary } from '../../fetchers/transactions';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client/prax';

export const TxsLoader: LoaderFunction = async (): Promise<TransactionSummary[]> => {
  await throwIfPraxNotConnectedTimeout();
  return await getAllTransactions();
};

export default function TransactionTable() {
  const data = useLoaderData() as TransactionSummary[];

  return (
    <>
      <div className='flex flex-col gap-[34px] md:hidden'>
        {data.map((tx, i) => (
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
          {data.map((tx, i) => (
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
