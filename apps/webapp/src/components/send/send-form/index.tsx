import { Button, Input } from '@penumbra-zone/ui';
import { useStore } from '../../../state/index.ts';
import { sendSelector, sendValidationErrors } from '../../../state/send.ts';
import { useToast } from '@penumbra-zone/ui/components/ui/use-toast';
import { InputBlock } from '../../shared/input-block';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { AssetBalance, getAssetBalances } from '../../../fetchers/balances';
import { useMemo } from 'react';
import { penumbraAddrValidation } from '../helpers';
import { throwIfExtNotInstalled } from '../../../fetchers/is-connected';
import InputToken from '../../shared/input-token.tsx';
import { useRefreshFee } from './use-refresh-fee.ts';
import { GasFee } from '../../shared/gas-fee.tsx';

export const SendAssetBalanceLoader: LoaderFunction = async (): Promise<AssetBalance[]> => {
  throwIfExtNotInstalled();
  const assetBalances = await getAssetBalances();

  if (assetBalances[0]) {
    // set initial account if accounts exist and asset if account has asset list
    useStore.setState(state => {
      state.send.selection = assetBalances[0];
    });
  }

  return assetBalances;
};

export const SendForm = () => {
  const assetBalances = useLoaderData() as AssetBalance[];
  const { toast } = useToast();
  const {
    selection,
    amount,
    recipient,
    memo,
    fee,
    feeTier,
    setAmount,
    setSelection,
    setRecipient,
    setFeeTier,
    setMemo,
    sendTx,
    txInProgress,
  } = useStore(sendSelector);

  useRefreshFee();

  const validationErrors = useMemo(() => {
    return sendValidationErrors(selection, amount, recipient);
  }, [selection, amount, recipient]);

  return (
    <form
      className='flex flex-col gap-4 xl:gap-3'
      onSubmit={e => {
        e.preventDefault();
        void sendTx(toast);
      }}
    >
      <InputBlock
        label='Recipient'
        className='mb-1'
        value={recipient}
        validations={[penumbraAddrValidation()]}
      >
        <Input
          variant='transparent'
          className='font-mono'
          placeholder='penumbra1…'
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
      </InputBlock>
      <InputToken
        label='Amount to send'
        placeholder='Enter an amount'
        className='mb-1'
        selection={selection}
        setSelection={setSelection}
        value={amount}
        onChange={e => {
          if (Number(e.target.value) < 0) return;
          setAmount(e.target.value);
        }}
        validations={[
          {
            type: 'error',
            issue: 'insufficient funds',
            checkFn: () => validationErrors.amountErr,
          },
        ]}
        balances={assetBalances}
      />

      <GasFee fee={fee} feeTier={feeTier} setFeeTier={setFeeTier} />

      <InputBlock
        label='Memo'
        value={memo}
        validations={[
          {
            type: 'error',
            issue: 'memo too long (>369 bytes)',
            checkFn: () => validationErrors.memoErr,
          },
        ]}
      >
        <Input
          variant='transparent'
          placeholder='Optional message'
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </InputBlock>
      <Button
        type='submit'
        variant='gradient'
        className='mt-3'
        size='lg'
        disabled={
          !Number(amount) ||
          !recipient ||
          !!Object.values(validationErrors).find(Boolean) ||
          txInProgress ||
          !selection
        }
      >
        Send
      </Button>
    </form>
  );
};
