import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionClassification } from './classification';

export const classifyTransaction = (txv?: TransactionView): TransactionClassification => {
  // Check if 'txv' is undefined and return "Unknown" if it is.
  if (!txv) {
    return 'unknown';
  }

  if (txv.bodyView?.actionViews.some(a => a.actionView.case === 'swap')) return 'swap';
  if (txv.bodyView?.actionViews.some(a => a.actionView.case === 'swapClaim')) return 'swapClaim';
  if (txv.bodyView?.actionViews.some(a => a.actionView.case === 'delegate')) return 'delegate';
  if (txv.bodyView?.actionViews.some(a => a.actionView.case === 'undelegate')) return 'undelegate';
  if (txv.bodyView?.actionViews.some(a => a.actionView.case === 'undelegateClaim'))
    return 'undelegateClaim';

  const hasOpaqueSpend = txv.bodyView?.actionViews.some(
    a => a.actionView.case === 'spend' && a.actionView.value.spendView.case === 'opaque',
  );
  const allSpendsVisible = !hasOpaqueSpend;

  const hasOpaqueOutput = txv.bodyView?.actionViews.some(
    a => a.actionView.case === 'output' && a.actionView.value.outputView.case === 'opaque',
  );
  const allOutputsVisible = !hasOpaqueOutput;

  // A visible output whose note is controlled by an opaque address is an output we don't control.
  const hasVisibleOutputWithOpaqueAddress = txv.bodyView?.actionViews.some(
    a =>
      a.actionView.case === 'output' &&
      a.actionView.value.outputView.case === 'visible' &&
      a.actionView.value.outputView.value.note?.address?.addressView.case === 'opaque',
  );

  // A visible output whose note is controlled by an opaque address is an output we do control.
  const hasVisibleOutputWithVisibleAddress = txv.bodyView?.actionViews.some(
    a =>
      a.actionView.case === 'output' &&
      a.actionView.value.outputView.case === 'visible' &&
      a.actionView.value.outputView.value.note?.address?.addressView.case === 'decoded',
  );

  // A transaction is internal if all spends and outputs are visible, and there are no outputs we don't control.
  const isInternal = allSpendsVisible && allOutputsVisible && !hasVisibleOutputWithOpaqueAddress;

  // Call a transaction a "transfer" if it only has spends and outputs.
  const isTransfer = txv.bodyView?.actionViews.every(
    a => a.actionView.case === 'spend' || a.actionView.case === 'output',
  );

  // If the tx has only spends and outputs, then it's a transfer. What kind?
  if (isTransfer) {
    // If we can't see at least one spend, but we can see an output we control, it's a receive.
    if (hasOpaqueSpend && hasVisibleOutputWithVisibleAddress) {
      return 'receive';
    }
    // If we can see all spends and outputs, it's a transaction we created...
    if (allSpendsVisible && allOutputsVisible) {
      // ... so it's either a send or an internal transfer, depending on whether there's an output we don't control.
      if (isInternal) {
        return 'internalTransfer';
      } else {
        return 'send';
      }
    }
  }

  if (isInternal) {
    // TODO: fill this in with classification of swaps, swapclaims, etc.
    return 'unknownInternal';
  }

  // Fallthrough
  return 'unknown';
};

export const TRANSACTION_LABEL_BY_CLASSIFICATION: Record<TransactionClassification, string> = {
  unknown: 'Unknown',
  unknownInternal: 'Unknown (Internal)',
  receive: 'Receive',
  send: 'Send',
  internalTransfer: 'Internal Transfer',
  swap: 'Swap',
  swapClaim: 'Swap Claim',
  delegate: 'Delegate',
  undelegate: 'Undelegate',
  undelegateClaim: 'Undelegate Claim',
};

export const getTransactionClassificationLabel = (txv?: TransactionView): string =>
  TRANSACTION_LABEL_BY_CLASSIFICATION[classifyTransaction(txv)];
