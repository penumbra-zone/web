import { Card, FadeTransition } from 'ui';
import React from 'react';
import { EduInfoCard } from '../../../shared';
import dynamic from 'next/dynamic';

const JsonTree = dynamic(() => import('./json-tree'), {
  ssr: false,
});

interface PageProps {
  params: { hash: string };
}

export default function Page({ params: { hash } }: PageProps) {
  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 p-5'>
          <div>
            <div className='text-xl font-bold'>Transaction hash</div>
            <div className='italic text-muted-foreground'>{hash}</div>
            <JsonTree hash={hash} />
          </div>
        </Card>
        <EduInfoCard src='/incognito.svg' label='Private Transaction' />
      </div>
    </FadeTransition>
  );
}
