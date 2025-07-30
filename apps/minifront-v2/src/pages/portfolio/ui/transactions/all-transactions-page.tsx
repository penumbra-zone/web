import { useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Card } from '@penumbra-zone/ui/Card';
import { Button } from '@penumbra-zone/ui/Button';
import { Text } from '@penumbra-zone/ui/Text';
import { Wallet2 } from 'lucide-react';

import { useBalancesStore } from '@/shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@/shared/hooks/use-connection';
import { PagePath } from '@/shared/const/page';
import { BreadCrumb, BreadcrumbItem } from '@/shared/ui/breadcrumb';
import { InfoDialog } from '../assets/info-dialog';
import { TransactionView } from './transaction-view';
import { TransactionCard } from './transaction-card';
import { createGetTxMetadata } from '@/shared/utils/get-tx-metadata';

export const AllTransactionsPage = observer(() => {
  const balancesStore = useBalancesStore();
  const balancesResponses = balancesStore.balancesResponses;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTx = searchParams.get('tx');
  const isConnected = useIsConnected();
  const { connectWallet } = useConnectWallet();

  // Create getTxMetadata function using centralized utility
  const getTxMetadata = createGetTxMetadata(balancesResponses);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Portfolio', path: PagePath.Portfolio },
    { label: 'Your Transactions' },
  ];

  const maxWidth = selectedTx ? 1200 : 752;

  const handleDeselectTransaction = () => {
    setSearchParams(prev => {
      prev.delete('tx');
      return prev;
    });
  };

  // If wallet is not connected, show connect wallet message
  if (!isConnected) {
    return (
      <div className='flex w-full flex-col items-center'>
        <div className='flex w-full max-w-[752px] flex-col'>
          <div className='flex items-center justify-between px-3 py-4'>
            <BreadCrumb items={breadcrumbItems} />
          </div>
          <Card>
            <div className='flex min-h-[400px] flex-col items-center justify-center gap-4'>
              <div className='size-8 text-text-secondary'>
                <Wallet2 className='size-full' />
              </div>
              <Text color='text.secondary' small>
                Connect wallet to see your transactions
              </Text>
              <div className='w-fit'>
                <Button actionType='default' density='compact' onClick={() => void connectWallet()}>
                  Connect wallet
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='flex w-full flex-col' style={{ maxWidth: `${maxWidth}px` }}>
        <div className='flex items-center justify-between px-3 py-4'>
          <BreadCrumb items={breadcrumbItems} />
          {!selectedTx && <InfoDialog />}
        </div>
        <div className='flex w-full flex-col gap-4 md:flex-row'>
          <div className={`flex w-full flex-col ${selectedTx ? 'md:w-1/2' : ''}`}>
            <TransactionCard
              title={null}
              showSeeAllLink={false}
              showInfoButton={false}
              // maxItems is not set, TransactionCard will show all summaries
            />
          </div>
          {selectedTx && (
            <div className='flex size-full flex-col items-start md:w-1/2'>
              <TransactionView
                key={selectedTx}
                txHash={selectedTx}
                getTxMetadata={getTxMetadata}
                walletAddressViews={[]}
                onDeselectTransaction={handleDeselectTransaction}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
