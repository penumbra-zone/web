'use client';

import React from 'react';
import { useTxInfo } from '../../../hooks/tx-info-by-hash';
import ReactJson from 'react-json-view';

import './overrides.css';

export default function JsonTree({ hash }: { hash: string }) {
  const { data, error, isError, isLoading } = useTxInfo(hash);

  console.log(data);

  return (
    <div className='mt-5 bg-black p-5'>
      <span className='text-red'>
        {isError && `${String(error)}. You may need to sync your blocks for this to be found.`}
      </span>
      <span className='text-yellow-600'>{isLoading && 'Loading...'}</span>
      {data && (
        <ReactJson
          name={false}
          src={data.toJson() as object}
          theme='bright'
          displayDataTypes={false}
          collapseStringsAfterLength={20}
          collapsed={2}
          displayObjectSize={false}
          enableClipboard={true}
        />
      )}
    </div>
  );
}
