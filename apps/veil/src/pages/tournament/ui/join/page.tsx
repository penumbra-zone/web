'use client';

import { PenumbraWaves } from '@/pages/explore/ui/waves';
import { PagePath } from '@/shared/const/pages';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TournamentQueryParams } from '@/features/tournament-earnings-canvas/types';

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
    <section className='mx-auto flex max-w-[1168px] flex-col gap-6 p-4'>
      <PenumbraWaves />
      <div className='flex w-full justify-center'>
        {/* eslint-disable-next-line @next/next/no-img-element -- allow img */}
        <img src={url} alt='Tournament Share Image' className='h-[315px] w-[600px]' />
      </div>
      <p className='text-center text-sm text-text-secondary'>Redirecting in {seconds} seconds...</p>
    </section>
  );
}
