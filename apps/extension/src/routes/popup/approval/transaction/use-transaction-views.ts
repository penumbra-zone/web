import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { useEffect, useMemo, useState } from 'react';
import { asPublicTransactionView, asReceiverTransactionView } from '@penumbra-zone/types';
import { TransactionViewTab } from './types';
import { useStore } from '../../../../state';
import { deserializedTransactionViewSelector } from '../../../../state/tx-approval';
import { isControlledAddress } from './is-controlled-address';

/**
 * A receiver transaction view is calculated asynchronously, since it needs to
 * call the async function `isControlledAddress` for each address. So we'll
 * encapsulate that logic inside its own hook.
 */
const useAsReceiver = (transactionView?: TransactionView) => {
  const [asReceiver, setAsReceiver] = useState<TransactionView | undefined>();

  useEffect(() => {
    if (transactionView) {
      asReceiverTransactionView(isControlledAddress)(transactionView)
        .then(setAsReceiver)
        .catch(() => {
          /** no-op */
        });
    }
  }, [transactionView]);

  return asReceiver;
};

export const useTransactionViews = () => {
  const asSender = useStore(deserializedTransactionViewSelector);
  const asReceiver = useAsReceiver(asSender);
  const asPublic = useMemo(
    () => (asSender ? asPublicTransactionView(asSender) : undefined),
    [asSender],
  );

  const [selectedTransactionViewName, setSelectedTransactionViewName] =
    useState<TransactionViewTab>(TransactionViewTab.SENDER);

  const transactionViews = {
    asSender,
    asReceiver,
    asPublic,
  };

  const selectedTransactionView = transactionViews[selectedTransactionViewName];

  return {
    selectedTransactionView,
    selectedTransactionViewName,
    setSelectedTransactionViewName,
  };
};
