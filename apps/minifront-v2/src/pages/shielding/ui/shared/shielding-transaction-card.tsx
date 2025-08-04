import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@penumbra-zone/ui/Button';
import { TransactionCard } from '@/pages/portfolio/ui/transactions/transaction-card';
import { useTransactionsStore } from '@/shared/stores/store-context';
import { PagePath } from '@/shared/const/page';

export const ShieldingTransactionCard = observer(() => {
  const transactionsStore = useTransactionsStore();

  // Directly use the observable list so MobX re-renders on change
  const filteredTransactions = transactionsStore.shieldingTransactions;

  // Create a custom header action for shielding context
  const headerAction = useMemo(
    () => (
      <Link to={PagePath.Transactions}>
        <Button actionType='default' density='slim'>
          View All
        </Button>
      </Link>
    ),
    [],
  );

  return (
    <TransactionCard
      title='Your Recent Shielding Activity'
      showInfoButton={false}
      showSeeAllLink={false}
      headerAction={headerAction}
      filteredTransactions={filteredTransactions}
    />
  );
});
