'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTxInfo } from '../../hooks/tx-info-by-hash';
import JsonTree from './json-tree';
import { TransactionViewComponent } from '@penumbra-zone/ui';

export default function HashParser() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');

  if (!hash) {
    return (<>
      <div>No Hash passed ❌</div>
    </>);
  }

  const { data, error, isError, isLoading } = useTxInfo(hash);

  if (isLoading) {
    return (<>
      <span className='text-yellow-600'>Loading...</span>
    </>);
  }

  if (isError || !data || !data.transaction || !data.view) {
    return (<>
      <div className='text-red'>
        ${String(
          error,
        )}. You may need to sync your blocks for this to be found. Or are you trying to view a transaction that you can't see? 🕵️
      </div>
    </>);
  }

  /*
  const publicView = viewFromEmptyPerspective(data?.transaction);
  */

  return (
    <>
      <TransactionViewComponent txv={data?.view} hash={hash} />
      { /*
      This should be in a tab, toggleable between "your view" and "public view", like the assets/txs dashboard toggle
      <TransactionViewComponent txv={publicView} hash={hash} />
      */ }
      <div className='text-xl font-bold'>Raw JSON</div>
      <JsonTree hash={hash} />
    </>
  );
}
