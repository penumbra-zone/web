import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Text } from '@penumbra-zone/ui/Text';
import { Button } from '@penumbra-zone/ui/Button';
import { List, Wallet2 } from 'lucide-react';
import { useTransactionsStore } from '@shared/stores/store-context';
import { useIsConnected, useConnectWallet } from '@shared/hooks/use-connection';

interface TransactionItem {
  id: string;
  height: string;
  description: string;
  hash: string;
}

const NotConnectedState = () => {
  const { connectWallet } = useConnectWallet();

  return (
    <Card title='Recent Transactions'>
      <div className='flex flex-col items-center justify-center min-h-[250px] gap-4'>
        <div className='size-8 text-text-secondary'>
          <Wallet2 className='w-full h-full' />
        </div>
        <Text color='text.secondary' small>
          Connect wallet to see your transactions
        </Text>
        <div className='w-fit'>
          <Button actionType='default' density='compact' onClick={connectWallet}>
            Connect wallet
          </Button>
        </div>
      </div>
    </Card>
  );
};

const NoTransactionsState = () => {
  return (
    <Card title='Recent Transactions'>
      <div className='flex flex-col items-center justify-center h-[250px] gap-4'>
        <div className='size-8 text-neutral-light'>
          <List className='w-full h-full' />
        </div>
        <Text color='text.secondary' small>
          You have no transactions yet. Send, receive, or trade assets to see your transaction
          history here.
        </Text>
      </div>
    </Card>
  );
};

export const TransactionCard = observer(() => {
  const transactionsStore = useTransactionsStore();
  const isConnected = useIsConnected();

  // Debug logging
  console.log('TransactionCard - isConnected:', isConnected);
  console.log(
    'TransactionCard - transactions length:',
    transactionsStore.sortedTransactions.length,
  );

  // If wallet is not connected, show connect wallet message
  if (!isConnected) {
    return <NotConnectedState />;
  }

  // If no transactions, show empty state
  if (transactionsStore.sortedTransactions.length === 0) {
    return <NoTransactionsState />;
  }

  return (
    <Card>
      <div className='p-4'>
        <div className='mb-4'>
          <Text h4 color='text.primary'>
            Recent Transactions
          </Text>
        </div>
        <div className='space-y-2'>
          {transactionsStore.sortedTransactions.slice(0, 5).map((tx: any, index: number) => (
            <div key={index} className='p-3 rounded-lg bg-other-tonalFill5'>
              <div className='flex justify-between items-center'>
                <Text small color='text.primary'>
                  Transaction #{index + 1}
                </Text>
                <Text detail color='text.muted'>
                  Block {tx.height?.toString() || 'Unknown'}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});
