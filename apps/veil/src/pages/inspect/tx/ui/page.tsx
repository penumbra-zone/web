'use client';

import { useParams } from 'next/navigation';
import { useTransactionInfo } from '../api/transaction';
import { TxViewer } from './tx-viewer';
import { Card } from '@penumbra-zone/ui/Card';
import { Skeleton } from '@/shared/ui/skeleton';
import { connectionStore } from '@/shared/model/connection';
import { observer } from 'mobx-react-lite';

const InspectTx = observer(() => {
  const params = useParams<{ hash: string }>();
  const { connected } = connectionStore;
  const { data: txInfo, isLoading, isError } = useTransactionInfo(params?.hash ?? '', connected);

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
          <Card>
            <div className='min-h-[300px] w-[840px] p-2 text-white'>
              {isLoading ? (
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
              ) : (
                <TxViewer txInfo={txInfo} />
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});

export { InspectTx };
