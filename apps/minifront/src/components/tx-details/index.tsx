import { Card } from '@penumbra-zone/ui/components/ui/card';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { TxViewer } from './tx-viewer';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { LoaderFunction, useLoaderData, useRouteError } from 'react-router-dom';
import { getTxInfoByHash } from '../../fetchers/tx-info-by-hash';
import { TransactionInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { throwIfPraxNotConnectedTimeout } from '@penumbra-zone/client/prax';
import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { GRID_LAYOUT_GAP_CLASSES } from '../constants';

export interface TxDetailsLoaderResult {
  hash: string;
  txInfo: TransactionInfo;
}

export const TxDetailsLoader: LoaderFunction = async ({
  params,
}): Promise<TxDetailsLoaderResult> => {
  await throwIfPraxNotConnectedTimeout();
  const hash = params['hash']!;
  const txInfo = await getTxInfoByHash(hash);
  return { txInfo, hash };
};

export const TxDetailsErrorBoundary = () => {
  const error = useRouteError();

  return <div className='text-red'>{String(error)}</div>;
};

export const TxDetails = () => {
  const { txInfo, hash } = useLoaderData() as TxDetailsLoaderResult;

  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <RestrictMaxWidth>
        <div className={`relative grid lg:grid-cols-3 ${GRID_LAYOUT_GAP_CLASSES}`}>
          <Card gradient className='flex-1 p-5 md:p-4 lg:col-span-2 lg:row-span-2 xl:p-5'>
            <TxViewer txInfo={txInfo} hash={hash} />
          </Card>
          <EduInfoCard
            className='row-span-1'
            src='./incognito.svg'
            label='Shielded Transactions'
            content={EduPanel.SHIELDED_TRANSACTION}
          />
        </div>
      </RestrictMaxWidth>
    </FadeTransition>
  );
};
