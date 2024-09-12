import { FormEventHandler, useMemo } from 'react';
import { ArrowUpFromDot } from 'lucide-react';
import { ValueInput } from '@penumbra-zone/ui/ValueInput';
import { Button } from '@penumbra-zone/ui/Button';
import { Card } from '@penumbra-zone/ui/Card';
import { FormField } from '@penumbra-zone/ui/FormField';
import { TextInput } from '@penumbra-zone/ui/TextInput';
import { AllSlices } from '../../../../state';
import { sendValidationErrors } from '../../../../state/send';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { useRefreshFee } from './use-refresh-fee';
import { useBalancesResponses } from '../../../../state/shared.ts';
import { GasFee } from './gas-fee.tsx';

const sendPageSelector = (state: AllSlices) => ({
  selection: state.send.selection,
  amount: state.send.amount,
  recipient: state.send.recipient,
  memo: state.send.memo,
  setAmount: state.send.setAmount,
  setSelection: state.send.setSelection,
  setRecipient: state.send.setRecipient,
  setMemo: state.send.setMemo,
  sendTx: state.send.sendTx,
  txInProgress: state.send.txInProgress,
});

export const SendPage = () => {
  const {
    selection,
    setSelection,
    amount,
    recipient,
    memo,
    setAmount,
    setRecipient,
    setMemo,
    txInProgress,
    sendTx,
  } = useStoreShallow(sendPageSelector);
  const { data: balancesResponses } = useBalancesResponses();

  useRefreshFee();

  const validationErrors = useMemo(() => {
    return sendValidationErrors(selection, amount, recipient);
  }, [selection, amount, recipient]);

  const submitButtonDisabled = useMemo(
    () =>
      !Number(amount) ||
      !recipient ||
      !!Object.values(validationErrors).find(Boolean) ||
      txInProgress ||
      !selection,
    [amount, recipient, validationErrors, txInProgress, selection],
  );

  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    void sendTx();
  }

  return (
    <form onSubmit={onSubmit}>
      <Card.Stack>
        <Card.Section>
          <FormField label="Recipient's address">
            <TextInput value={recipient} onChange={setRecipient} placeholder='penumbra1abc123...' />
          </FormField>
        </Card.Section>

        <Card.Section>
          <ValueInput
            label='Amount'
            placeholder='Amount to send...'
            balances={balancesResponses}
            value={amount}
            onValueChange={setAmount}
            selection={selection}
            onSelectionChange={setSelection}
          />
        </Card.Section>

        <Card.Section>
          <GasFee />
        </Card.Section>

        <Card.Section>
          <FormField label='Memo'>
            <TextInput value={memo} onChange={setMemo} placeholder='Optional Message...' />
          </FormField>
        </Card.Section>
      </Card.Stack>

      <Button
        type='submit'
        icon={ArrowUpFromDot}
        actionType='accent'
        disabled={submitButtonDisabled}
      >
        Send
      </Button>
    </form>
  );
};
