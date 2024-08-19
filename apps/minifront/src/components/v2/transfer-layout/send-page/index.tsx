import { Card } from '@repo/ui/Card';
import { FormField } from '@repo/ui/FormField';
import { SegmentedControl } from '@repo/ui/SegmentedControl';
import { TextInput } from '@repo/ui/TextInput';
import { AllSlices } from '../../../../state';
import { sendValidationErrors } from '../../../../state/send';
import { FeeTier_Tier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { Button } from '@repo/ui/Button';
import { ArrowUpFromDot } from 'lucide-react';
import { useMemo } from 'react';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { useRefreshFee } from './use-refresh-fee';

const sendPageSelector = (state: AllSlices) => ({
  selection: state.send.selection,
  amount: state.send.amount,
  recipient: state.send.recipient,
  memo: state.send.memo,
  fee: state.send.fee,
  feeTier: state.send.feeTier,
  assetFeeMetadata: state.send.assetFeeMetadata,
  setAmount: state.send.setAmount,
  setSelection: state.send.setSelection,
  setRecipient: state.send.setRecipient,
  setFeeTier: state.send.setFeeTier,
  setMemo: state.send.setMemo,
  sendTx: state.send.sendTx,
  txInProgress: state.send.txInProgress,
});

const FEE_TIER_OPTIONS = [
  {
    label: 'Low',
    value: FeeTier_Tier.LOW,
  },
  {
    label: 'Medium',
    value: FeeTier_Tier.MEDIUM,
  },
  {
    label: 'High',
    value: FeeTier_Tier.HIGH,
  },
];

export const SendPage = () => {
  const {
    selection,
    amount,
    recipient,
    memo,
    feeTier,
    setAmount,
    setRecipient,
    setFeeTier,
    setMemo,
    txInProgress,

    /**
     * @todo: Implement form controls that use these properties:
     */
    // fee,
    // setSelection,
    // assetFeeMetadata,
    // sendTx,
  } = useStoreShallow(sendPageSelector);

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

  return (
    <>
      <Card.Stack>
        <Card.Section>
          <FormField label="Recipient's address">
            <TextInput value={recipient} onChange={setRecipient} placeholder='penumbra1abc123...' />
          </FormField>
        </Card.Section>

        <Card.Section>
          <FormField label='Amount' helperText='#0: 123,456.789'>
            <TextInput
              type='number'
              value={amount}
              onChange={setAmount}
              placeholder='Amount to send...'
              min={0}
            />
          </FormField>
        </Card.Section>

        <Card.Section>
          <FormField label='Fee Tier'>
            <SegmentedControl value={feeTier} onChange={setFeeTier} options={FEE_TIER_OPTIONS} />
          </FormField>
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
    </>
  );
};
