'use client';

import { client } from '../../extension-client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from 'ui';

export default function ChainParams() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['appParameters'],
    refetchInterval: 0,
    queryFn: () => client.appParameters({}),
  });

  return (
    <div>
      <div>appParameters response</div>
      {data && 'got result ✅'}
      <div>
        {data && JSON.stringify(data.toJson())}
        {isLoading && 'is loading ⚠️'}
        {isError && 'is error ⛔️'}
      </div>
      <Link href='/'>
        <Button>Back</Button>
      </Link>
    </div>
  );
}
