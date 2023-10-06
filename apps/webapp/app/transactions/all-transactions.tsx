'use client';

import { client } from '../../extension-client';
import { useMemo } from 'react';
import { useStreamQuery } from 'penumbra-transport';
import { uint8ArrayToHex } from 'penumbra-types';

export default function AllTransactions() {
  const transactions = useMemo(() => client.transactionInfo({}), []);
  const { data, end, error } = useStreamQuery(transactions);

  return (
    <div>
      {!end && <div>is loading ⚠️</div>}
      {error && <div className='text-red-700'>Error ⛔️: {error}</div>}
      {end && <div className='text-green-700'>Finished loading ✅️</div>}
      {data.map((r, i) => {
        return (
          <div key={i}>
            <div>Tx hash: {r.txInfo?.id?.hash && uint8ArrayToHex(r.txInfo.id.hash)}</div>
            <div className='ml-5'>Block height: {Number(r.txInfo?.height)}</div>
          </div>
        );
      })}
    </div>
  );
}
