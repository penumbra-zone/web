'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { shorten, uint8ArrayToHex } from '@penumbra-zone/types';
import { FilledImage } from '../../shared';
import Link from 'next/link';
import { Action } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

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
            actions: summarizeActions(tx.txInfo?.transaction?.body?.actions ?? []),
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
                {tx.actions}
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

/**
 * This function takes an array of strings and returns a string that lists
 * the unique elements along with their counts (if more than one). The order
 * of the unique strings in the output is the same as in the original array.
 *
 * @example
 * let arr: string[] = ['swap', 'claim', 'spend', 'claim'];
 * console.log(summarizeActions(arr));  // Outputs: "swap, 2 claim, spend"
 */
const summarizeActions = (actions: Action[]): string => {
  const cases = actions.map(a => a.action.case ?? 'unknown');
  const counts = new Map<string, number>();

  for (const item of cases) {
    if (!counts.has(item)) {
      counts.set(item, 1);
    } else {
      counts.set(item, counts.get(item)! + 1);
    }
  }

  return Array.from(counts, ([item, count]) => (count > 1 ? `${count} ${item}` : item)).join(', ');
};
