import { TransactionView } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { getTransmissionKeyByAddress } from '@penumbra-zone/wasm/keys';

// Some transaction views (TXVs) require additional preprocessing before being rendered
// in the UI component library. For example, when handling IBC withdrawals with transparent
// addresses, this component transforms ephemeral addresses into their bech32-encoded
// transparent form to ensure the proper data is being displayed.
export const txvTranslator = (view: TransactionView): TransactionView => {
  // 'Ics20Withdrawal' action view
  if (!view.bodyView) {
    return view;
  }

  const withdrawalAction = view.bodyView.actionViews.find(
    action => action.actionView.case === 'ics20Withdrawal',
  );

  if (withdrawalAction?.actionView.case === 'ics20Withdrawal') {
    const withdrawal = withdrawalAction.actionView.value;
    // Create 80-byte array initialized to zeros, then set first 32 bytes to transmission key.
    // This constructs a valid address format where:
    // - First 32 bytes: transmission key
    // - Remaining 48 bytes: zeroed (16-byte diversifier + 32-byte clue key)
    if (withdrawal.returnAddress && withdrawal.useTransparentAddress) {
      const newInner = new Uint8Array(80).fill(0);
      newInner.set(getTransmissionKeyByAddress(withdrawal.returnAddress), 0);
      withdrawal.returnAddress.inner = newInner;
    }
  }

  return view;
};
