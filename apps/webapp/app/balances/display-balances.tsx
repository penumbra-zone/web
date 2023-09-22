'use client';

import { client } from '../../extension-client';
import { useQuery } from '@tanstack/react-query';

export default function DisplayBalances() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['balances'],
    refetchInterval: 0,
    queryFn: () => client.chainParameters({}),
  });

  return (
    <div>
      <div>Balances response</div>
      {data && 'got result ✅'}
      {data && JSON.stringify(data.toJson())}
      {isLoading && 'is loading ⚠️'}
      {isError && 'is error ⛔️'}
    </div>
  );
}
