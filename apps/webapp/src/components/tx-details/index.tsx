import { Card, FadeTransition } from '@penumbra-zone/ui';
import { TxViewer } from './hash-parser.tsx';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card.tsx';
import { EduPanel } from '../shared/edu-panels/content.ts';
import { LoaderFunction, useLoaderData, useRouteError } from 'react-router-dom';
import { getTxInfoByHash } from '../../fetchers/tx-info-by-hash.ts';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { throwIfExtNotInstalled } from '../../fetchers/is-connected.ts';

export interface TxDetailsLoaderResult {
  hash: string;
  txInfo: TransactionInfo;
}

export const TxDetailsLoader: LoaderFunction = async ({
  params,
}): Promise<TxDetailsLoaderResult> => {
  await throwIfExtNotInstalled();

  const hash = params['hash']!;
  const txInfo = await getTxInfoByHash(hash);
  return { txInfo, hash };
};

export const TxDetailsErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div className='text-red'>
      <div>{String(error)}</div>
      <div>=========================</div>
      <div>
        You may need to sync your blocks for this to be found. Or are you trying to view a
        transaction that you can&apos;t see? 🕵️
      </div>
    </div>
  );
};

export const TxDetails = () => {
  const { txInfo, hash } = useLoaderData() as TxDetailsLoaderResult;

  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <div className='relative mx-auto grid max-w-[1276px] grid-cols-3 gap-5'>
        <Card gradient className='col-span-2 row-span-2 flex-1 md:p-4 xl:p-5'>
          <TxViewer txInfo={txInfo} hash={hash} />
        </Card>
        <EduInfoCard
          src='/incognito.svg'
          label='Shielded Transactions'
          content={EduPanel.SHIELDED_TRANSACTION}
        />
      </div>
    </FadeTransition>
  );
};
