'use client';

import { useParams } from 'next/navigation';
import { useBlockSummary } from '../api/block';
import { Card } from '@penumbra-zone/ui/Card';
import { Skeleton } from '@/shared/ui/skeleton';
import { BlockSummary } from './block-summary';

export function InspectBlock() {
  const params = useParams<{ height: string }>();
  const blockheight = params?.height;
  const { data: blockSummary, isError } = useBlockSummary(blockheight ?? '');

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='mb-4'>
        {isError ? (
          <Card title={`Couldn’t fetch transaction.`}>
            <div className='min-h-[300px] w-[840px] p-2 text-white'>
              Something went wrong while fetching the transaction.
            </div>
          </Card>
        ) : (
          <Card title={`Block #${blockheight}`}>
            <div className='min-h-[300px] w-[840px] p-2 text-white'>
              {blockSummary ? (
                <BlockSummary blockSummary={blockSummary} />
              ) : (
                <div>
                  <div className='mb-2 h-8 w-[822px]'>
                    <Skeleton />
                  </div>
                  <div className='mb-2 h-6 w-[722px]'>
                    <Skeleton />
                  </div>
                  <div className='h-4 w-[422px]'>
                    <Skeleton />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
