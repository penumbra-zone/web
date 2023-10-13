'use client';

import { viewClient } from '../../clients/grpc';
import { useMemo } from 'react';
import { uint8ArrayToBase64 } from 'penumbra-types';
import { useCollectedStream } from 'penumbra-transport';

export default function DisplayBalances() {
  const balances = useMemo(() => viewClient.balances({}), []);
  const { data, end, error } = useCollectedStream(balances);

  return (
    <div>
      {!end && <div>is loading ⚠️</div>}
      {error && <div className='text-red-700'>Error ⛔️: {error}</div>}
      {end && <div className='text-green-700'>Finished loading ✅️</div>}
      {data.map((r, i) => {
        return (
          <div key={i}>
            <div>Account: {r.account?.account ?? 0}</div>
            <div className='ml-5'>
              Asset id:{' '}
              {r.balance?.assetId?.inner ? uint8ArrayToBase64(r.balance.assetId.inner) : 'none'}
            </div>
            <div className='ml-5'>Hi {Number(r.balance?.amount?.hi)}</div>
            <div className='ml-5'>Lo {Number(r.balance?.amount?.lo)}</div>
          </div>
        );
      })}
    </div>
  );
}
