'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { useCollectedStream } from 'penumbra-transport';
import { shorten, uint8ArrayToHex } from '@penumbra-zone/types';
import { FilledImage } from '../../shared';
import Link from 'next/link';

const useTxs = () => {
  const transactions = useMemo(() => viewClient.transactionInfo({}), []);
  const { data, error } = useCollectedStream(transactions);

  const formatted = useMemo(
    () =>
      data
        .map(tx => {
          return {
            height: Number(tx.txInfo?.height ?? 0n),
            hash: tx.txInfo?.id?.hash ? uint8ArrayToHex(tx.txInfo.id.hash) : 'unknown',
            actions: tx.txInfo?.transaction?.body?.actions.map(a => a.action.case) ?? [],
          };
        })
        .sort((a, b) => {
          return b.height - a.height;
        }),
    [data],
  );

  return { data: formatted, error: error ? String(error) : undefined };
};

export default function TransactionTable() {
  const { data, error } = useTxs();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='text-center'>Block Height</TableHead>
          <TableHead className='text-center'>Tx Hash</TableHead>
          <TableHead className='text-center'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((tx, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className='flex items-center justify-center gap-3 text-[15px] font-normal'>
                {tx.height}
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-center gap-[10px] font-normal'>
                {shorten(tx.hash)}
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-center gap-[10px] font-normal'>
                {tx.actions.join(', ')}
              </div>
            </TableCell>
            <TableCell>
              <Link href={`/tx/?hash=${tx.hash}`}>
                <FilledImage
                  src='/more.svg'
                  className='h-4 w-4 cursor-pointer hover:opacity-50'
                  alt='More'
                />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {error}
    </Table>
  );
}
