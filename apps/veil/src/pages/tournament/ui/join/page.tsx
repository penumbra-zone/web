'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { PagePath } from '@/shared/const/pages';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';

// this serves to keep the url short
// as we will use it in an x post
export const queryParamMap = {
  t: 'epoch',
  e: 'earnings',
  v: 'votingStreak',
  i: 'incentivePool',
  l: 'lpPool',
  d: 'delegatorPool',
};

export interface TournamentQueryParams {
  t: string;
  e: `${number}:${string}`;
  v: `${number}:${string}`;
  i: `${number}:${string}`;
  l: `${number}:${string}`;
  d: `${number}:${string}`;
}

export interface TournamentParams extends Record<string, string> {
  epoch: string;
  earnings: `${number}:${string}`;
  votingStreak: `${number}:${string}`;
  incentivePool: `${number}:${string}`;
  lpPool: `${number}:${string}`;
  delegatorPool: `${number}:${string}`;
}

export function TournamentJoinPage({
  imageUrl,
  searchParams,
}: {
  imageUrl: string;
  searchParams: TournamentQueryParams;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  if (!searchParams['t']) {
    redirect(PagePath.Tournament);
  }

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (seconds === 1) {
  //       router.push(PagePath.Tournament);
  //     }
  //     setSeconds(seconds - 1);
  //   }, 1000);
  // }, [seconds, router]);

  const url = `${imageUrl}?${new URLSearchParams(searchParams).toString()}`;

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <div className='flex w-full justify-center'>
        {/* eslint-disable-next-line @next/next/no-img-element -- allow img */}
        <img src={url} alt='Tournament Share Image' className='w-[600px] h-[315px]' />
      </div>
      <p className='text-center text-sm text-text-secondary'>Redirecting in {seconds} seconds...</p>
    </section>
  );
}
