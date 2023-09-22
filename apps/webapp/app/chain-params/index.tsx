'use client';

import { client } from '../../extension-client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from 'ui/components/ui/button';

export default function ChainParams() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['chainParameters'],
    refetchInterval: 0,
    queryFn: () => client.chainParameters({}),
  });

  return (
    <div>
      <div>chainParameters response</div>
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
