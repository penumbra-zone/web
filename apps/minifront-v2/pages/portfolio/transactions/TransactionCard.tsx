import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Card } from '@penumbra-zone/ui/Card';
import { Button } from '@penumbra-zone/ui/Button';
import { Skeleton } from '@penumbra-zone/ui/Skeleton';
import { uint8ArrayToHex } from '@penumbra-zone/types/hex';

import { useMinifrontTransactionsList } from '../../../../hooks/v2/transactions-v2';
import { PagePath } from '../../../metadata/paths';
import { InfoDialog } from '../assets/InfoDialog';
import { TransactionListItem } from './TransactionListItem';

export interface TransactionCardProps {
  title?: string | null;
  showInfoButton?: boolean;
  showSeeAllLink?: boolean;
  maxItems?: number;
  headerAction?: ReactNode;
}

export const TransactionCard = ({
  title = 'Your Recent Transactions',
  showInfoButton = true,
  showSeeAllLink = true,
  maxItems,
  headerAction,
}: TransactionCardProps) => {
  const {
    data: allTransactions,
    walletAddressViews,
    getTxMetadata,
    isLoading: loadingTransactions,
  } = useMinifrontTransactionsList();

  const navigate = useNavigate();

  const transactionsToDisplay =
    maxItems && allTransactions.length > 0 ? allTransactions.slice(0, maxItems) : allTransactions;

  const infoButton = showInfoButton ? <InfoDialog /> : null;
  const seeAllLink = showSeeAllLink ? (
    <Link to={PagePath.V2_TRANSACTIONS_FULL}>
      <Button actionType='default' density='slim'>
        See All
      </Button>
    </Link>
  ) : null;

  const headerContent =
    infoButton || seeAllLink ? (
      <div className='flex items-center gap-2'>
        {infoButton}
        {seeAllLink}
      </div>
    ) : null;

  const cardTitle = title === null || title === '' ? undefined : title;

  const getTxHash = (tx: TransactionInfo): string => {
    return tx.id?.inner ? uint8ArrayToHex(tx.id.inner) : '';
  };

  const getSkeletonLength = () => {
    if (maxItems) {
      return maxItems;
    }
    if (transactionsToDisplay.length === 0) {
      return 3;
    }
    return transactionsToDisplay.length;
  };

  return (
    <div>
      <Card title={cardTitle} headerAction={headerAction} endContent={headerContent}>
        <div className='flex flex-col gap-1'>
          {loadingTransactions ? (
            Array.from({ length: getSkeletonLength() }).map((_, i) => (
              <div key={i} className='h-16 w-full'>
                <Skeleton />
              </div>
            ))
          ) : (
            <>
              {transactionsToDisplay.length > 0 ? (
                transactionsToDisplay.map(transaction => (
                  <TransactionListItem
                    key={getTxHash(transaction)}
                    info={transaction}
                    getTxMetadata={getTxMetadata}
                    walletAddressViews={walletAddressViews}
                    onClick={() =>
                      navigate(`${PagePath.V2_TRANSACTIONS_FULL}?tx=${getTxHash(transaction)}`)
                    }
                  />
                ))
              ) : (
                <div className='flex h-[100px] items-center justify-center text-muted-foreground'>
                  Transactions will be displayed here
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
