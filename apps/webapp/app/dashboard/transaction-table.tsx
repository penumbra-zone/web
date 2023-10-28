'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@penumbra-zone/ui';
import { useMemo } from 'react';
import { viewClient } from '../../clients/grpc';
import { useCollectedStream } from '@penumbra-zone/transport';
import { shorten, uint8ArrayToHex } from '@penumbra-zone/types';
import { FilledImage } from '../../shared';
import Link from 'next/link';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

const classifyTransaction = (txv?: TransactionView): string => {
  // Check if 'txv' is undefined and return "Unknown" if it is.
  if (!txv) {
    return "Unknown";
  }

  const hasOpaqueSpend = txv.bodyView?.actionViews.some(
    a => a.actionView?.case === 'spend' && a.actionView?.value?.spendView.case === 'opaque'
  );
  const allSpendsVisible = !hasOpaqueSpend;

  const hasOpaqueOutput = txv.bodyView?.actionViews.some(
    a => a.actionView?.case === 'output' && a.actionView?.value?.outputView.case === 'opaque'
  );
  const allOutputsVisible = !hasOpaqueOutput;

  // A visible output whose note is controlled by an opaque address is an output we don't control.
  const hasVisibleOutputWithOpaqueAddress = txv.bodyView?.actionViews.some(
    a => a.actionView?.case === 'output'
      && a.actionView?.value?.outputView.case === 'visible'
      && a.actionView?.value?.outputView.value?.note?.address?.addressView.case === 'opaque'
  );

  // A visible output whose note is controlled by an opaque address is an output we do control.
  const hasVisibleOutputWithVisibleAddress = txv.bodyView?.actionViews.some(
    a => a.actionView?.case === 'output'
      && a.actionView?.value?.outputView.case === 'visible'
      && a.actionView?.value?.outputView.value?.note?.address?.addressView.case === 'visible'
  );

  // A transaction is internal if all spends and outputs are visible, and there are no outputs we don't control.
  const isInternal = allSpendsVisible && allOutputsVisible && !hasVisibleOutputWithOpaqueAddress;

  // Call a transaction a "transfer" if it only has spends and outputs.
  const isTransfer = txv.bodyView?.actionViews.every(
    a => a.actionView?.case === 'spend' || a.actionView?.case === 'output'
  );

  // If the tx has only spends and outputs, then it's a transfer. What kind?
  if (isTransfer) {
    // If we can't see at least one spend, but we can see an output we control, it's a recieve.
    if (hasOpaqueSpend && hasVisibleOutputWithVisibleAddress) {
      return "Receive";
    }
    // If we can see all spends and outputs, it's a transaction we created...
    if (allSpendsVisible && allOutputsVisible) {
      // ... so it's either a send or an internal transfer, depending on whether there's an output we don't control.
      if (isInternal) {
        return "Internal Transfer";
      } else {
        return "Send";
      }
    }
  }

  if (isInternal) {
    // TODO: fill this in with classification of swaps, swapclaims, etc.
    return "Unknown (Internal)";
  }

  // Fallthrough
  return "Unknown";
}

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
            description: classifyTransaction(tx.txInfo?.view),
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
          <TableHead className='text-center'>Description</TableHead>
          <TableHead className='text-center'>Transaction Hash</TableHead>
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
                {tx.description}
              </div>
            </TableCell>
            <TableCell>
              <div className='flex items-center justify-center gap-[10px] font-normal'>
                <Link href={`/tx/?hash=${tx.hash}`}>{shorten(tx.hash, 8)}</Link>
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
