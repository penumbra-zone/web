import { Tabs, TabsList, TabsTrigger } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { TransactionViewTab } from './types';
import { useStore } from '../../../../state';
import { deserializedTransactionViewSelector } from '../../../../state/tx-approval';
import { classifyTransaction } from '@penumbra-zone/types';

export const ViewTabs = ({
  defaultValue,
  onValueChange,
}: {
  defaultValue: TransactionViewTab;
  onValueChange: (value: TransactionViewTab) => void;
}) => {
  const transactionView = useStore(deserializedTransactionViewSelector);
  const classification = classifyTransaction(transactionView);
  const showReceiverTransactionView = classification === 'send';

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={value => onValueChange(value as TransactionViewTab)}
    >
      <TabsList
        className={cn('mx-auto mb-8 grid w-[100%] gap-4', {
          'grid-cols-2': !showReceiverTransactionView,
          'grid-cols-3': showReceiverTransactionView,
        })}
      >
        <TabsTrigger value={TransactionViewTab.SENDER}>Your View</TabsTrigger>

        {showReceiverTransactionView && (
          <TabsTrigger value={TransactionViewTab.RECEIVER}>Receiver&apos;s View</TabsTrigger>
        )}

        <TabsTrigger value={TransactionViewTab.PUBLIC}>Public View</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
