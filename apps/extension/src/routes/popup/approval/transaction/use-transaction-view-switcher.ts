import { TransactionViewTab } from './types';
import { txApprovalSelector } from '../../../../state/tx-approval';
import { useMemo, useState } from 'react';
import { useStore } from '../../../../state';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

export const useTransactionViewSwitcher = (): {
  selectedTransactionView: TransactionView | undefined;
  selectedTransactionViewName: TransactionViewTab;
  setSelectedTransactionViewName: (value: TransactionViewTab) => void;
} => {
  const { asSender, asReceiver, asPublic } = useStore(txApprovalSelector);

  const [selectedTransactionViewName, setSelectedTransactionViewName] =
    useState<TransactionViewTab>(TransactionViewTab.SENDER);

  const deserializedTransactionViews = useMemo(() => {
    if (!asSender || !asReceiver || !asPublic) return {};

    return {
      asSender: TransactionView.fromJsonString(asSender),
      asReceiver: TransactionView.fromJsonString(asReceiver),
      asPublic: TransactionView.fromJsonString(asPublic),
    };
  }, [asSender, asReceiver, asPublic]);

  const selectedTransactionView = deserializedTransactionViews[selectedTransactionViewName];

  return {
    selectedTransactionView,
    selectedTransactionViewName,
    setSelectedTransactionViewName,
  };
};
