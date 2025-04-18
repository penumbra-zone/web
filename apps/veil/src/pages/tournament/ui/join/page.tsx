'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { PagePath } from '@/shared/const/pages';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const queryParamMap = {
  t: 'epoch',
  e: 'earnings',
  v: 'votingStreak',
  i: 'incentivePool',
  l: 'lpPool',
  d: 'delegatorPool',
} as const;

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
  searchParams: Record<string, string>;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  if (!searchParams['t']) {
    redirect(PagePath.Tournament);
  }

  useEffect(() => {
    setTimeout(() => {
      if (seconds === 1) {
        router.push(PagePath.Tournament);
      }
      setSeconds(seconds - 1);
    }, 1000);
  }, [seconds, router]);

  const url = `${imageUrl}?${new URLSearchParams(searchParams).toString()}`;

  return (
    <section className='flex flex-col gap-6 p-4 max-w-[1168px] mx-auto'>
      <PenumbraWaves />
      <div className='flex w-full justify-center'>
        {/* eslint-disable-next-line @next/next/no-img-element -- allow img */}
        <img src={url} alt='Tournament Share Image' className='w-[512px] h-[512px]' />
      </div>
      <p className='text-center text-sm text-text-secondary'>Redirecting in {seconds} seconds...</p>
    </section>
  );
}
