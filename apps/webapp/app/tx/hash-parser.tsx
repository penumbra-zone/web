'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import JsonTree from './json-tree';

export default function HashParser() {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');

  return (
    <>
      {hash ? (
        <>
          <div className='text-xl font-bold'>Transaction</div>
          <div className='font-mono italic text-muted-foreground'>{hash}</div>
          <JsonTree hash={hash} />
        </>
      ) : (
        <div>No Hash passed ❌</div>
      )}
    </>
  );
}
