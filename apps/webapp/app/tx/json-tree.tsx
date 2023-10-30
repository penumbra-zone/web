'use client';

import React from 'react';
import ReactJson from 'react-json-view';

import './overrides.css';

export default function JsonTree({ jsonObj }: { jsonObj: object }) {
  return (
    <div className='mt-5 rounded bg-black p-5'>
      <ReactJson
        name={false}
        style={{ fontFamily: 'Iosevka Term' }}
        src={jsonObj}
        theme='bright'
        displayDataTypes={false}
        collapseStringsAfterLength={20}
        collapsed={2}
        displayObjectSize={false}
        enableClipboard={true}
      />
    </div>
  );
}
