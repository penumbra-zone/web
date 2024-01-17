import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const classifyTransaction = (txv?: TransactionView): string => {
  // Check if 'txv' is undefined and return "Unknown" if it is.
  if (!txv) {
    return 'Unknown';
  }

  const actionTypes = txv.bodyView?.actionViews.map(a => a.actionView.case);
  const actionTypesString = actionTypes?.join(', ') ?? '';

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
      a.actionView.value.outputView.value.note?.address?.addressView.case === 'visible',
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
      return 'Receive';
    }
    // If we can see all spends and outputs, it's a transaction we created...
    if (allSpendsVisible && allOutputsVisible) {
      // ... so it's either a send or an internal transfer, depending on whether there's an output we don't control.
      if (isInternal) {
        return 'Internal Transfer';
      } else {
        return 'Send';
      }
    }
  }

  if (isInternal) {
    // TODO: fill this in with classification of swaps, swapclaims, etc.
    return `Unknown ${actionTypesString} (Internal)`;
  }

  // Fallthrough
  return `Unknown ${actionTypesString}`;
};
