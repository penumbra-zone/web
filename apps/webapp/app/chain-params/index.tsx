'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from 'ui';
import { stdClient } from '../../clients/std';
import { viewClient } from '../../clients/grpc';

export default function ChainParams() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['appParameters'],
    refetchInterval: 0,
    queryFn: () => viewClient.appParameters({}),
  });

  const {
    data: pingData,
    isLoading: pingLoading,
    isError: pingError,
  } = useQuery({
    queryKey: ['ping'],
    refetchInterval: 0,
    queryFn: () => stdClient.ping('Hello World'),
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
      <div>PING response:</div>
      <div>{pingData}</div>
      <div>{pingLoading && 'is loading ⚠️'}</div>
      <div>{pingError && 'is error ⛔️'}</div>
    </div>
  );
}
