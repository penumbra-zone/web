import { Card } from '@repo/ui/components/ui/card';
import { FadeTransition } from '@repo/ui/components/ui/fade-transition';
import { TxViewer } from './tx-viewer';
import { EduInfoCard } from '../shared/edu-panels/edu-info-card';
import { EduPanel } from '../shared/edu-panels/content';
import { useParams, useRouteError } from 'react-router-dom';
import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { useTransactionInfo } from '../../state/transactions';

export const TxDetailsErrorBoundary = () => {
  const error = useRouteError();

  return <div className='text-red'>{String(error)}</div>;
};

export const TxDetails = () => {
  const { hash } = useParams<{ hash: string }>();

  const txInfo = useTransactionInfo(hash!);

  if (
    !txInfo.data?.id ||
    // Don't show a previously loaded transaction while a new one is loading
    txInfo.loading
  )
    return null;

  return (
    <FadeTransition className='flex min-h-[calc(100vh-122px)] flex-col items-stretch justify-start'>
      <RestrictMaxWidth>
        <div className='relative grid grid-std-spacing lg:grid-cols-3'>
          <Card gradient className='flex-1 p-5 md:p-4 lg:col-span-2 lg:row-span-2 xl:p-5'>
            <TxViewer txInfo={txInfo.data} />
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
