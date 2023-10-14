'use client';

import React from 'react';
import ReactJson from 'react-json-view';

export default function JsonTree({ hash }: { hash: string }) {
  return (
    <div className='mt-5 bg-black p-5'>
      <ReactJson
        src={{ moo: 'strest', hash: hash }}
        theme='bright'
        displayDataTypes={false}
        collapseStringsAfterLength={20}
        collapsed={2}
      />
    </div>
  );
}
